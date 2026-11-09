#!/usr/bin/env bash
# Why Math? / interactive OpenAI API-key setup on MP.
# The secret never appears in the terminal, shell history, command arguments, Git or service plist.
set -euo pipefail
set +x
umask 077

LOCAL_ONLY=0
if [[ "${1:-}" == "--local-only" ]]; then LOCAL_ONLY=1
elif [[ $# -ne 0 ]]; then
  printf 'Usage: bash %s [--local-only]\n' "$0" >&2
  exit 2
fi

if [[ ! -r /dev/tty ]]; then
  printf 'Run this script from an interactive MP Terminal window.\n' >&2
  exit 1
fi

CONFIG_DIR="${HOME}/.config/why-math"
KEY_PATH="${CONFIG_DIR}/openai-api-key"
key=''
tmp=''
cleanup() {
  key=''
  if [[ -n "$tmp" && -f "$tmp" ]]; then rm -f -- "$tmp"; fi
}
trap cleanup EXIT

printf '\nWhy Math? — OpenAI API key setup (MP)\n'
printf 'Paste your new API key below. Input is hidden.\n'
IFS= read -r -s -p 'OPENAI_API_KEY: ' key < /dev/tty || {
  printf '\nNo key entered.\n' >&2
  exit 1
}
printf '\n'

if [[ "$key" != sk-* || ${#key} -lt 35 || "$key" == *[[:space:]]* ]]; then
  printf 'Invalid key format. No file was changed.\n' >&2
  exit 1
fi

mkdir -p -- "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR"
tmp="$(mktemp "${CONFIG_DIR}/.openai-api-key.XXXXXXXX")"
printf '%s\n' "$key" > "$tmp"
chmod 600 "$tmp"
mv -f -- "$tmp" "$KEY_PATH"
tmp=''
key=''

printf 'Saved securely on MP: %s (permissions 600)\n' "$KEY_PATH"

if (( LOCAL_ONLY )); then
  printf 'MP only. No key was sent to MSM2-1.\n'
  exit 0
fi

printf '\nWhy Math? public beta currently runs on MSM2-1.\n'
printf 'Copy the key there over SSH (encrypted connection)? [Y/n]: '
IFS= read -r answer < /dev/tty || answer='n'
if [[ -n "$answer" && "$answer" != [yY] && "$answer" != [yY][eE][sS] ]]; then
  printf 'Skipped remote copy. Key is still safely saved on MP.\n'
  exit 0
fi

if ! ssh -o BatchMode=yes -o ConnectTimeout=10 MSM2-1 \
  'set -eu; umask 077; mkdir -p "$HOME/.config/why-math"; chmod 700 "$HOME/.config/why-math"; t=$(mktemp "$HOME/.config/why-math/.openai-api-key.XXXXXXXX"); trap '\''rm -f "$t"'\'' EXIT; cat > "$t"; chmod 600 "$t"; mv -f "$t" "$HOME/.config/why-math/openai-api-key"; trap - EXIT; test -s "$HOME/.config/why-math/openai-api-key"' \
  < "$KEY_PATH"; then
  printf 'Remote copy failed. The MP copy remains secure.\n' >&2
  exit 1
fi
printf 'Copied securely to MSM2-1: ~/.config/why-math/openai-api-key\n'
printf 'The API key is stored. The app backend must be configured to use this file.\n'
