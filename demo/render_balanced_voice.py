#!/usr/bin/env python3
"""Cuts 27 raster demo frames into an under-90s version with a balanced expressive English narration.
Uses seven approved expressive speech MP3 files committed under demo/audio/.
Does not suggest that simulated learners are real. Source shots come from render_fastcut.py.
"""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[1]
WORK=Path('/tmp/why-math-balanced-render');WORK.mkdir(exist_ok=True)
SRC=Path('/tmp/why-math-fastcut')
VOICE=ROOT/'demo/audio'
if not all((SRC/f'shot{i:02}.png').is_file() for i in range(27)):
    subprocess.run(['python3',str(ROOT/'demo/render_fastcut.py'),'--shots-only'],check=True)
for i in range(27):
    if not (SRC/f'shot{i:02}.png').is_file():raise RuntimeError('Missing PNG source scene')
for i in range(7):
    if not (VOICE/f'seg{i}.mp3').is_file():raise RuntimeError('Download the seven expressive narration segments first')
ends=[4,8,15,18,22,25,27];windows=[9,9,19,10,8,10,7]
original=[2.7,2.5,2.7,2.1,3.2,2.8,3.1,2.9,3.4,3.4,3.5,3.5,3.8,4.1,2.3,3.1,3.1,3.6,3.1,3.,3.,3.,3.1,3.1,4.,3.1,3.]
assert len(original)==27
lens=[];offset=0
for end,target in zip(ends,windows):
    sub=original[offset:end];ratio=target/sum(sub)
    values=[round(v*ratio,3) for v in sub];values[-1]=round(values[-1]+target-sum(values),3)
    lens.extend(values);offset=end
assert abs(sum(lens)-72)<.005
for i,duration in enumerate(lens):
    clip=WORK/f'clip{i:02}.mp4'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-framerate','25','-i',str(SRC/f'shot{i:02}.png'),'-t',str(duration),'-vf','scale=1280:720,fps=25,format=yuv420p','-an','-c:v','libx264','-preset','veryfast','-crf','24',str(clip)],check=True)
lines='\n'.join(f"file '{WORK/f'clip{i:02}.mp4'}'" for i in range(27))+'\n';(WORK/'clips.txt').write_text(lines)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(WORK/'clips.txt'),'-c','copy',str(WORK/'silent.mp4')],check=True)
starts=[0,9,18,37,47,55,65];assert starts[-1]+windows[-1]==72
filters=[f'[{i}:a]aresample=48000,adelay={st*1000}|{st*1000}[a{i}]' for i,st in enumerate(starts)]
filters.append(''.join(f'[a{i}]' for i in range(7))+'amix=inputs=7:duration=longest:dropout_transition=0,apad,atrim=duration=72[voice]')
inputs=[]
for i in range(7):inputs+=['-i',str(VOICE/f'seg{i}.mp3')]
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*inputs,'-filter_complex',';'.join(filters),'-map','[voice]','-c:a','aac','-b:a','160k',str(WORK/'voice.m4a')],check=True)
out=ROOT/'demo/why-math-90s-demo.mp4'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(WORK/'silent.mp4'),'-i',str(WORK/'voice.m4a'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-t','72','-movflags','+faststart',str(out)],check=True)
print('OUTPUT',out,subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size','-of','default=noprint_wrappers=1',str(out)],text=True),flush=True)
