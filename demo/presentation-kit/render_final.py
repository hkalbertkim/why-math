#!/usr/bin/env python3
"""Assemble the 72s final demo ONLY after real browser recordings are supplied.
The script deliberately refuses to replace a missing UI clip with a screenshot or synthetic UI.
"""
from pathlib import Path
import json,subprocess,sys

KIT=Path(__file__).resolve().parent
PLAN=json.loads((KIT/'edit-plan.json').read_text())
SHOTS=PLAN['shots'];TMP=KIT/'render-cache';TMP.mkdir(exist_ok=True)
OUT=KIT/'why-math-final-live-demo.mp4'
FPS=30

def duration(path):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(path)],text=True).strip())

missing=[]
for item in SHOTS:
    if item['type']=='CAPTURE':
        path=KIT/'capture-slots'/f"{item['id']}.mp4"
        if not path.is_file():missing.append(item['id'])
if missing:
    print('Cannot render final live demo. Real browser video is missing for these slots:')
    for item in missing:print(' -',item)
    print('No fake or frozen UI footage has been substituted.')
    raise SystemExit(2)

manifest=[]
for i,shot in enumerate(SHOTS):
    t=shot['end']-shot['start'];target=TMP/f'{i:02}.mp4'
    if shot['type']=='CAPTURE':
        src=KIT/'capture-slots'/f"{shot['id']}.mp4"
        raw=duration(src)
        # Speeds actual recorded actions to the storyboard slot rather than creating a fake static scene.
        speed=raw/t
        if not (.35<=speed<=5.0):raise RuntimeError(f'Capture duration unsupported for {shot["id"]}: {raw:.2f}s in {t:.2f}s slot')
        filter=f'[0:v]setpts=(PTS-STARTPTS)/{speed},scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps={FPS},format=yuv420p[video]'
        if shot['overlay']:
            label=KIT/'assets'/f"{shot['overlay']}.png"
            filter+=f';[video][1:v]overlay=0:0:format=auto,format=yuv420p[out]'
            command=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-loop','1','-framerate',str(FPS),'-i',str(label),'-filter_complex',filter,'-map','[out]']
        else:
            command=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-filter_complex',filter,'-map','[video]']
    else:
        path=KIT/'assets'/f"{shot['id']}.png"
        command=['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-framerate',str(FPS),'-i',str(path),'-vf',f'fps={FPS},format=yuv420p']
    subprocess.run(command+['-t',str(t),'-an','-c:v','libx264','-preset','veryfast','-crf','22','-pix_fmt','yuv420p',str(target)],check=True)
    manifest.append(f"file '{target}'")
(TMP/'files.txt').write_text('\n'.join(manifest)+'\n')
silent=TMP/'silent.mp4'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(TMP/'files.txt'),'-c','copy',str(silent)],check=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(silent),'-i',str(KIT/'audio/why-math-narration-72s.m4a'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-t','72','-movflags','+faststart',str(OUT)],check=True)
print('Rendered only actual browser recordings with two editorial PNG cards:',OUT)
print('Duration:',duration(OUT),'seconds')
