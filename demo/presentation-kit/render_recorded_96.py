#!/usr/bin/env python3
"""Final 96-sec recorded UI demo, from only actual browser Playwright WebM captures.
One extra approved voice stem extends the existing 72-second narration.
Two editorial PNG cards only. Never reconstruct or fake the app UI.
"""
from pathlib import Path
import json,subprocess,math
ROOT=Path(__file__).resolve().parents[2]
KIT=Path(__file__).resolve().parent
RAW=KIT/'recordings';WORK=KIT/'recorded-render-cache';WORK.mkdir(exist_ok=True)
CLIPS=KIT/'capture-slots';CLIPS.mkdir(exist_ok=True)
ASSETS=KIT/'assets'
FF='ffmpeg';FP='ffprobe'
def run(*args):subprocess.run([*args],check=True)
def duration(f):return float(subprocess.check_output([FP,'-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(f)],text=True).strip())
def rec(name):
 p=RAW/(name+'.webm')
 if not p.is_file() or p.stat().st_size<30000:raise FileNotFoundError('Actual browser video required: '+str(p))
 return p

def real(name,source,target,ss=0,seconds=None):
 src=rec(source); available=duration(src)-ss
 if available<=0.25:raise ValueError('No real footage for '+name)
 srcsec=min(seconds or available,available)
 # Use verified real frames, with modest timing adjustment to synchronize narration.
 ratio=target/srcsec
 if not(.4<=ratio<=2.3):raise ValueError(f'Excessive speed change {name}: {ratio:.2f}')
 dest=WORK/(name+'.mp4')
 run(FF,'-hide_banner','-loglevel','error','-y','-ss',str(ss),'-i',str(src),'-vf',f'setpts=(PTS-STARTPTS)*{ratio},scale=1280:720,fps=30,format=yuv420p','-t',str(target),'-an','-r','30','-c:v','libx264','-preset','veryfast','-crf','23',str(dest))
 if abs(duration(dest)-target)>0.25:raise RuntimeError(f'Capture duration mismatch {name}: {duration(dest):.2f} vs {target}')
 return dest

def card(name,target):
 src=ASSETS/(name+'.png');assert src.exists();dst=WORK/(name+'.mp4')
 run(FF,'-hide_banner','-loglevel','error','-y','-loop','1','-framerate','30','-i',str(src),'-t',str(target),'-vf','scale=1280:720,format=yuv420p','-an','-c:v','libx264','-preset','veryfast','-crf','24',str(dst));return dst

def side_by_side(target):
    a=rec('learner_a_live');b=rec('learner_b_live');dst=WORK/'live_ab_split.mp4'
    # Show the final ACTUAL two teacher replies, not the inference wait period.
    seg=4.4
    astart=max(0,duration(a)-seg); bstart=max(0,duration(b)-seg)
    ratio=target/seg
    run(FF,'-hide_banner','-loglevel','error','-y','-ss',str(astart),'-i',str(a),'-ss',str(bstart),'-i',str(b),'-filter_complex',f'[0:v]crop=640:720:0:0,setpts=(PTS-STARTPTS)*{ratio},scale=640:720,fps=30,format=yuv420p[a];[1:v]crop=640:720:0:0,setpts=(PTS-STARTPTS)*{ratio},scale=640:720,fps=30,format=yuv420p[b];[a][b]hstack=inputs=2,format=yuv420p[out]','-map','[out]','-t',str(target),'-an','-c:v','libx264','-preset','veryfast','-crf','23',str(dst));return dst

# 96 seconds with 2.5-sec opening, 3-sec CTA, and live UI in all other shots.
shots=[
 ('opening',0,2.5,'card','opening'),
 ('home_and_start',2.5,9,'real','home_and_a_start',0,5.55),
 ('guided_start',9,14,'real','home_and_a_start',1.0,4.55),
 ('teacher_question',14,18,'real','learner_a_live',0,4),
 ('learner_a_question',18,25,'real','learner_a_live',0,7.0),
 ('learner_a_teacher',25,37,'real','learner_a_live',4.0,7.44),
 ('learner_b_question',37,44,'real','learner_b_live',0,6.5),
 ('learner_b_teacher',44,51,'real','learner_b_live',3.8,5.92),
 ('live_ab_split',51,60,'split',None),
 ('korean_live',60,70,'real','korean_live',0,9.63),
 ('apple_add',70,75,'real','counting_real_valid',0,4.0),
 ('apple_remove',75,79,'real','counting_real_valid',3.4,4.72),
 ('living_textbook_a',79,84,'real','learner_a_live',5.4,6.04),
 ('living_textbook_b',84,89,'real','textbook_b_valid',3.5,6.06),
 ('app_close',89,93,'real','app_close_valid',0,3.07),
 ('ending',93,96,'card','ending')
]
assert shots[0][1]==0 and shots[-1][2]==96 and all(x[2]==y[1] for x,y in zip(shots,shots[1:]));
manifest=[]
for name,start,end,typ,src,*rest in shots:
 d=end-start
 if typ=='real': clip=real(name,src,d,*rest)
 elif typ=='split':clip=side_by_side(d)
 else:clip=card(src,d)
 manifest.append(f"file '{clip}'")
 print('SHOT',name,f'{start:05.1f}–{end:05.1f}s',typ,'source',src or 'two Chrome sessions',flush=True)
(WORK/'manifest.txt').write_text('\n'.join(manifest)+'\n')
video=WORK/'video.mp4'
run(FF,'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(WORK/'manifest.txt'),'-c','copy',str(video))
# Seven approved balanced storyteller stems + one additional matched A/B comparison segment.
voice=ROOT/'demo/audio'
extra=KIT/'audio/extra/extra0.mp3'
if not extra.exists():raise FileNotFoundError('Missing the approved additional AI narration audio')
files=[voice/'seg0.mp3',voice/'seg1.mp3',voice/'seg2.mp3',extra,voice/'seg3.mp3',voice/'seg4.mp3',voice/'seg5.mp3',voice/'seg6.mp3']
starts=[0,9,18,37,60,70,79,89]
for f in files:
 if not f.exists():raise FileNotFoundError(f)
inputs=[]
for f in files:inputs+=['-i',str(f)]
filters=[f'[{i}:a]aresample=48000,adelay={starts[i]*1000}|{starts[i]*1000}[a{i}]' for i in range(len(files))]
filters.append(''.join(f'[a{i}]' for i in range(len(files)))+'amix=inputs=8:duration=longest:dropout_transition=0,apad,atrim=duration=96,alimiter=limit=0.92[out]')
audio=WORK/'narration.m4a'
run(FF,'-hide_banner','-loglevel','error','-y',*inputs,'-filter_complex',';'.join(filters),'-map','[out]','-c:a','aac','-b:a','192k',str(audio))
out=KIT/'why-math-final-live-demo.mp4'
run(FF,'-hide_banner','-loglevel','error','-y','-i',str(video),'-i',str(audio),'-map','0:v:0','-map','1:a:0','-t','96','-c:v','copy','-c:a','copy','-movflags','+faststart',str(out))
metadata={'duration':duration(out),'shots':[{ 'name':name,'start':start,'end':end,'source_kind':typ,'source':src} for name,start,end,typ,src,*_ in shots],'disclosures':['AI learners are simulations','model outputs recorded from real running app','two editorial PNG cards only','edited timing and split screen are from genuine Chrome browser captures']}
(KIT/'recordings'/'final-video-evidence.json').write_text(json.dumps(metadata,indent=2)+'\n')
print('FINAL',out,'seconds',duration(out),'bytes',out.stat().st_size,flush=True)
