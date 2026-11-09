#!/usr/bin/env python3
"""Deterministic 18-shot 96s video: the four pre-existing original PPTX art images
and chronological REAL browser captures; never creates SVG or synthetic app UI.
"""
from pathlib import Path
import subprocess, json, hashlib
ROOT=Path(__file__).resolve().parents[2]
KIT=Path(__file__).resolve().parent
ASSET=KIT/'assets'; RAW=KIT/'recordings'; CACHE=KIT/'18slide-render-cache';CACHE.mkdir(exist_ok=True)
F='ffmpeg';P='ffprobe';FPS=30

def run(args):subprocess.run(args,check=True)
def dur(p):return float(subprocess.check_output([P,'-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(p)],text=True))
def art(num,length):
 source=ASSET/f'why_math_original_slide_{num:02}.png';dest=CACHE/f'art{num:02}.mp4'
 assert source.is_file(),source
 run([F,'-hide_banner','-loglevel','error','-y','-loop','1','-framerate','30','-i',str(source),'-t',str(length),'-vf','scale=1280:720:flags=lanczos,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','20','-an',str(dest)])
 return dest

def record(name,source,length,start=0,span=None,crop=None):
 original=RAW/f'{source}.webm';assert original.is_file(),original
 available=dur(original)-start
 lengthSrc=min(span or available,available)
 if lengthSrc<0.6: raise RuntimeError('No source '+name)
 ratio=length/lengthSrc
 out=CACHE/f'{name}.mp4'
 vf=f'setpts=(PTS-STARTPTS)*{ratio},'
 if crop:vf+=f'crop={crop},'
 vf+='scale=1280:720:flags=lanczos,fps=30,format=yuv420p'
 run([F,'-hide_banner','-loglevel','error','-y','-ss',str(start),'-i',str(original),'-vf',vf,'-t',str(length),'-an','-r','30','-c:v','libx264','-preset','veryfast','-crf','22',str(out)])
 if abs(dur(out)-length)>.15: raise RuntimeError(f'Duration mismatch {name}: {dur(out)} instead of {length}')
 return out

def compare(length):
 aa=RAW/'learner_a_live.webm';bb=RAW/'learner_b_live.webm';out=CACHE/'compare_ab.mp4'
 astart=max(0,dur(aa)-4.8);bstart=max(0,dur(bb)-4.8)
 v=f'[0:v]crop=640:720:0:0,setpts=(PTS-STARTPTS)*{length/4.8},scale=640:720,fps=30,format=yuv420p[a];[1:v]crop=640:720:0:0,setpts=(PTS-STARTPTS)*{length/4.8},scale=640:720,fps=30,format=yuv420p[b];[a][b]hstack=inputs=2,format=yuv420p[v]'
 run([F,'-hide_banner','-loglevel','error','-y','-ss',str(astart),'-i',str(aa),'-ss',str(bstart),'-i',str(bb),'-filter_complex',v,'-map','[v]','-t',str(length),'-an','-c:v','libx264','-preset','veryfast','-crf','22',str(out)])
 return out

# Original PPTX slide numbers/timings. Source recordings proceed FORWARD throughout;
# adjacent A (and B) ranges do not overlap or loop back to their beginning.
shots=[
 ('01','art',1,0,2.5),
 ('02','record','home_and_a_start',2.5,9,0,5.55),
 ('03','record','learner_a_live',9,14,0,2.25),
 ('04','record','learner_a_live',14,18,2.25,2.15),
 ('05','record','learner_a_live',18,25,4.4,2.8),
 ('06','record','learner_a_live',25,37,7.2,4.24),
 ('07','record','learner_b_live',37,44,0,4.7),
 ('08','record','learner_b_live',44,51,4.7,5.02),
 ('09','art',9,51,55),
 ('10','split',None,55,60),
 ('11','record','korean_live',60,70,0,9.64),
 ('12','record','counting_real_valid',70,75,0,4),
 ('13','record','counting_real_valid',75,79,4,4.12),
 ('14','art',14,79,83),
 ('15','record','learner_a_live',83,86,8.0,3.44),
 ('16','record','textbook_b_valid',86,89,6.5,3.06),
 ('17','record','app_close_valid',89,93,0,3.07),
 ('18','art',18,93,96),
]
clips=[];evidence=[]
for s in shots:
    idx,typ,src,start,end,*rest=s;length=end-start
    if typ=='art':path=art(src,length)
    elif typ=='split':path=compare(length)
    else:path=record(f'ui_{idx}',src,length,*rest)
    clips.append(f"file '{path}'");evidence.append({'slide':idx,'start':start,'end':end,'kind':typ,'source':src,'output':path.name})
    print('RENDERED',idx,'time',start,'-',end,'source',src,'real' if typ!='art' else 'original PPTX PNG',flush=True)
(CACHE/'list.txt').write_text('\n'.join(clips)+'\n')
video=CACHE/'silent96.mp4';run([F,'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(CACHE/'list.txt'),'-c','copy',str(video)])
audio=KIT/'recorded-render-cache/narration.m4a';assert audio.is_file()
out=ROOT/'demo/why-math-final-original-art-96s.mp4'
run([F,'-hide_banner','-loglevel','error','-y','-i',str(video),'-i',str(audio),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-t','96','-movflags','+faststart',str(out)])
assert abs(dur(out)-96)<.09
(KIT/'original_18slide_edit_evidence.json').write_text(json.dumps({'source':'EXISTING 4K slide PNG artwork from PPTX (delivered as lossily compressed 1280x720 frames) + actual recorded Chrome app clips','audio':'approved original 96-second storyteller narration','subtitle':False,'slides':evidence},indent=2))
print('COMPLETE',str(out),out.stat().st_size,'duration',dur(out),flush=True)
