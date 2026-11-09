# OpenAI API key setup for Why Math?

Run on MP (MacBook Pro) in a normal, interactive Terminal window:

```bash
bash ~/setup-whymath-key.sh
```

The script asks for the existing **Why Math OpenAI API key** with terminal echo disabled. Paste the key once and press Return. It stores the key outside this repository at `~/.config/why-math/openai-api-key` with restrictive permissions (directory 700, key 600). It then asks before copying it to MSM2-1 over SSH for the hosted beta. You may answer `n` to keep it only on MP.

- The key does **not** belong in GitHub, `.env` files committed to git, screenshots, or a chat message.
- This script securely **installs the credential**; the backend must separately enable and test its OpenAI model integration before replacing Ollama.
- Local-only option: `bash ~/setup-whymath-key.sh --local-only`.
- For rotation, run the script again to replace the stored credential. Revocation is managed in the OpenAI Platform account.
