#!/usr/bin/env python3
"""Why Math 90-second fast-cut launch demo. Real screenshots + raster PNG design (NO SVG).
All on-screen student test results are labeled simulated; no fake outcomes or mastery metrics.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import subprocess, math, textwrap
ROOT=Path(__file__).resolve().parents[1]; DEMO=ROOT/'demo'; TMP=Path('/tmp/why-math-fastcut'); TMP.mkdir(exist_ok=True)
W,H=1280,720
FG=(24,51,42); GREEN=(29,108,83); CREAM=(247,244,236); LIME=(217,242,91); MUTED=(94,113,103)
F='/System/Library/Fonts/Supplemental/Arial.ttf'; B='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
def font(n,bold=False):return ImageFont.truetype(B if bold else F,n)
def text(draw,xy,s,size=32,color=FG,bold=False):draw.text(xy,s,font=font(size,bold),fill=color)
def rounded(d,box,r=26,fill='white',outline=None,width=1):d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)
def bg(dark=False):
    im=Image.new('RGB',(W,H),FG if dark else CREAM);d=ImageDraw.Draw(im)
    for i in range(7):
        x=1000;y=120;r=70+i*68
        d.ellipse((x-r,y-r,x+r,y+r),outline=(45,94,71) if dark else (227,232,216),width=2)
    return im
def chrome(im,tag,number):
    d=ImageDraw.Draw(im);rounded(d,(32,25,215,65),18,FG if im.getpixel((0,0))!=FG else LIME)
    text(d,(48,37),tag.upper(),18,LIME if im.getpixel((0,0))!=FG else FG,True)
    text(d,(1216,34),f'{number:02}',19,MUTED,True)
    return im
def wrap(s,width=34):return textwrap.wrap(s,width=width,break_long_words=False)
def title_slide(tag,headline,sub=None,dark=False,accent=None):
    im=bg(dark);d=ImageDraw.Draw(im);ink=CREAM if dark else FG
    text(d,(90,155),headline,66,ink,True)
    if sub:
        for i,line in enumerate(wrap(sub,55)): text(d,(95,270+i*48),line,32,(204,225,210) if dark else MUTED)
    if accent: text(d,(92,585),accent,27,LIME if dark else GREEN,True)
    return im
def crop(img,box):
    w,h=img.size
    return img.crop((int(w*box[0]),int(h*box[1]),int(w*box[2]),int(h*box[3])))
def screenshot_slide(src,title,sub,focus=None,layout='wide'):
    im=bg();d=ImageDraw.Draw(im)
    text(d,(70,103),title,51,FG,True);text(d,(73,169),sub,23,MUTED)
    shot=Image.open(src).convert('RGB')
    if focus:shot=crop(shot,focus)
    if layout=='wide':
        target=(1130,425);x,y=75,240
    else:target=(710,420);x,y=285,248
    shot=ImageOps.fit(shot,target,Image.Resampling.LANCZOS,centering=(.48,.32))
    shadow=Image.new('RGBA',(target[0]+40,target[1]+36));sd=ImageDraw.Draw(shadow);rounded(sd,(15,12,target[0]+22,target[1]+24),18,(0,0,0,60));shadow=shadow.filter(ImageFilter.GaussianBlur(14));im.paste(shadow,(x-18,y-12),shadow)
    im.paste(shot,(x,y));d=ImageDraw.Draw(im);d.rounded_rectangle((x,y,x+target[0],y+target[1]),radius=12,outline=(213,224,211),width=3)
    return im
def compare(srcA,srcB,title='SAME AGE. SAME GOAL.',sub='Different responses. Different teaching moves.'):
    im=bg();d=ImageDraw.Draw(im);text(d,(72,88),title,49,FG,True);text(d,(75,151),sub,24,MUTED)
    for idx,(src,label,color) in enumerate([(srcA,'STUDENT A • SIMULATED',(54,132,189)),(srcB,'STUDENT B • SIMULATED',(143,86,170))]):
        x=72+idx*575; y=222; rounded(d,(x,y,x+555,650),19,'white')
        pic=Image.open(src).convert('RGB');pic=ImageOps.fit(pic,(525,353),Image.Resampling.LANCZOS,centering=(.5,.30));im.paste(pic,(x+15,y+15))
        rounded(d,(x+15,y+378,x+526,y+411),11,color);text(d,(x+30,y+385),label,16,'white',True)
    return im
def visual_math(n):
    im=bg();d=ImageDraw.Draw(im);text(d,(65,82),'MAKE THE IDEA TANGIBLE',44,FG,True)
    text(d,(70,139),'A basket shows why zero is a number.',25,MUTED)
    back=Image.open(ROOT/'public/assets/counting-bg.png').convert('RGB');back=ImageOps.fit(back,(1050,445),Image.Resampling.LANCZOS);im.paste(back,(115,218))
    basket=Image.open(ROOT/'public/assets/basket.png').convert('RGBA');basket.thumbnail((330,330));im.paste(basket,(475,315),basket)
    apple=Image.open(ROOT/'public/assets/red-apple.png').convert('RGBA');apple.thumbnail((110,110))
    for i in range(n):im.paste(apple,(505+i*67,333+(i%2)*5),apple)
    text(d,(210,293),str(n),98,GREEN,True);text(d,(226,397),'apples',30,GREEN)
    text(d,(205,580),'0  →  1  →  2',34,GREEN,True)
    return im
def vocab_badge(im,label):
    d=ImageDraw.Draw(im);rounded(d,(76,650,475,690),13,(216,236,224));text(d,(90,657),label,17,GREEN,True);return im
A=DEMO/'captures/student-a.png';Bcap=DEMO/'captures/student-b.png';KO=DEMO/'captures/korean.png';ZERO=ROOT/'docs/screenshots/why-math-desktop.png'
shots=[]
def add(duration,img,desc):shots.append((duration,img,desc))
# 0–10: why (not a long logo hold)
add(2.7,title_slide('the problem','ONE LESSON.', 'Thirty students. Thirty different minds.',True),'single lesson problem')
add(2.5,title_slide('the problem','ONE PACE.', 'Students are expected to keep up.',True),'one pace')
add(2.7,title_slide('the gap','MEMORIZE ≠ UNDERSTAND', 'Knowing a formula is not the same as knowing why.'),'concept gap')
add(2.1,title_slide('the shift','WHY MATH?', 'Make the lesson adapt to the learner.',True),'product reveal')
# 10–22: teacher-led
add(3.2,screenshot_slide(ZERO,'THE TEACHER STARTS.','No perfect question required.'),'teacher begins')
add(2.8,title_slide('product','ONE ADAPTIVE TEACHER', 'Guided learning or free conversation.'),'one engine')
add(3.1,screenshot_slide(ZERO,'TEACH, THEN OBSERVE','Each response becomes a clue about understanding.',(0.04,.19,.59,.85)),'teacher question')
add(2.9,title_slide('the loop','LISTEN → EXPLAIN → CHECK','Update the next lesson from observed evidence.',True),'adaptive loop')
# 22–46: A/B personas and comparison
add(3.4,screenshot_slide(A,'STUDENT A · AGE 14','Simulated learner · vocabulary gap.',(0.035,.18,.57,.75)),'A answer')
add(3.4,screenshot_slide(A,'A ASKS ABOUT WORDS','The tutor starts with meaning, not a formula.',(0.04,.34,.6,.86)),'A teacher response')
add(3.5,screenshot_slide(A,'EXPLAIN THE CONCEPT','A real local AI response, not a scripted age mode.'),'A annotated')
add(3.5,screenshot_slide(Bcap,'STUDENT B · AGE 14','Simulated learner · a different misconception.',(0.03,.18,.57,.73)),'B answer')
add(3.8,screenshot_slide(Bcap,'B GETS A NEW EXAMPLE','One shared engine. Another learning route.',(0.04,.39,.59,.86)),'B instruction')
add(4.1,compare(A,Bcap),'two students side by side')
add(2.3,title_slide('the difference','NOT AGE PRESETS.','What the student says changes the lesson.',True),'no hard coded modes')
# 46–59 Korean
add(3.1,screenshot_slide(KO,'KOREAN WORKS TOO','Real Korean teacher response · local Ollama.'),'Korean teacher')
add(3.1,screenshot_slide(KO,'A QUESTION IS NOT A FAILURE','Uncertainty is recorded as observation, not mastery.',(0.31,.2,.97,.73)),'Korean learning state')
add(3.6,title_slide('all learners','MANY WAYS TO EXPLAIN','Every learner can start from a different place.'),'adaptive all ages')
# 59–72 hands-on
add(3.1,visual_math(0),'zero apples')
add(3.0,visual_math(1),'one apple')
add(3.0,visual_math(2),'two apples')
add(3.0,screenshot_slide(ROOT/'docs/screenshots/why-math-counting-two.png','FROM WORDS TO ACTION','Real PNG layers and working add/remove controls.'),'actual visual app')
# 71–83 living textbook
add(3.1,screenshot_slide(A,'THE BOOK WRITES ITSELF','Lesson notes and observations update automatically.',(.48,.12,.99,.85)),'living textbook A')
add(3.1,screenshot_slide(Bcap,'STILL CHECKING ≠ MASTERED','Uncertain answers are not declared learned.',(.49,.12,.99,.82)),'living textbook B')
add(4.0,compare(A,Bcap,'ONE TEACHER. TWO PATHS.','Simulated tests show software adaptation, not proven learning gains.'),'final comparison')
# ending
add(3.1,title_slide('the future','WHY MATH?', 'Same mathematical truth. Different paths to understanding.',True),'future')
add(3.0,title_slide('try it','EXPLORE THE DEMO', 'github.com/hkalbertkim/why-math',True,'AI lessons · Korean + English'),'GitHub CTA')
total=sum(n for n,_,_ in shots)
assert len(shots)>=23,(len(shots),total)
# Match each visual chapter to its corresponding 0–10, 10–22, ..., 83–90 narration window.
chapter_ends=[4,8,15,18,22,25,27]
chapter_durations=[10,12,24,13,13,11,7]
normalized=[]; previous=0
for end,target in zip(chapter_ends,chapter_durations):
    chapter=shots[previous:end]; base=sum(t for t,_,_ in chapter)
    scaled=[(round(t*target/base,3),im,desc) for t,im,desc in chapter]
    last_t,last_im,last_desc=scaled[-1]
    scaled[-1]=(round(last_t+target-sum(t for t,_,_ in scaled),3),last_im,last_desc)
    normalized+=scaled; previous=end
shots=normalized
assert round(sum(t for t,_,_ in shots),2)==90.0

print('SHOTS',len(shots),'TOTAL',sum(s[0] for s in shots),flush=True)
shot_lines=['# Why Math? — 27-cut 90-second visual edit list','','All graphics are PNG rasters. Actual app captures are preserved; A/B users are simulated test agents.','','| Time | Shot |','|---|---|']
start=0.0
for duration,_,description in shots:
    end=start+duration
    shot_lines.append(f'| {start:05.1f}–{end:05.1f}s | {description} |')
    start=end
(DEMO/'SHOT_LIST.md').write_text('\n'.join(shot_lines)+'\n')

for i,(duration,im,desc) in enumerate(shots):im.save(TMP/f'shot{i:02}.png',optimize=True)
# A quiet underlying pulse, so audio is not clipped or jarring. Narration is foreground.
voice_segments=[
 (0,10,'Fixed lessons fail students who fall behind. We memorize formulas without knowing why they work. An infinitely patient AI can adapt explanations instead of forcing every student to adapt.'),
 (10,22,'Why Math changes this. The AI teacher begins a lesson, even if you do not know what to ask. It listens, explains, and checks your understanding before choosing the next step.'),
 (22,46,'Compare two simulated fourteen-year-old students starting from the same lesson. Student A struggles with mathematical vocabulary. The teacher explains the words first. Student B has a different misconception, so the same teacher offers a different example. These are real model-generated responses, not prewritten lessons for each age. The teacher never sees the hidden student test profiles.'),
 (46,59,'The tutor also teaches in Korean. Students can switch languages without losing their learning record. A question is not an error. Why Math records uncertainty, then explains again. The learning record stays with the student.'),
 (59,72,'Math should be visual. Add an apple, then remove it. Watch the count change. These are real PNG images in an interactive lesson. An empty basket has zero apples. Now the abstract number has a visible meaning.'),
 (72,83,'The Living Textbook updates automatically with each explanation, student response, and open question. Students can revisit ideas without taking extra notes. One correct answer does not prove mastery.'),
 (83,90,'Same mathematics. Different paths to understanding. Try Why Math. Find the demo and code on GitHub.')
]
manifest=[]; cursor=0
for i,(dur,_,desc) in enumerate(shots):
    path=TMP/f'clip{i:02}.mp4'; start=cursor;cursor+=dur
    # Subtle within-shot 2% zoom, actual pixels remain raster.
    zoom='scale=1280:720,fps=25,format=yuv420p'
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-framerate','25','-i',str(TMP/f'shot{i:02}.png'),'-t',str(dur),'-vf',zoom,'-an','-c:v','libx264','-preset','veryfast','-crf','25','-pix_fmt','yuv420p',str(path)]
    subprocess.run(cmd,check=True)
    manifest.append(f"file '{path}'")
    print('rendered',i+1,'of',len(shots),desc,flush=True)
(TMP/'clips.txt').write_text('\n'.join(manifest)+'\n')
video=TMP/'silent.mp4'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(TMP/'clips.txt'),'-c','copy',str(video)],check=True)
# Place narrated segment tracks at their timeline offsets; fast cuts continue under the narration.
tracks=[]
for i,(start,end,script) in enumerate(voice_segments):
    (TMP/f'narration{i:02}.txt').write_text(script+'\n')
    track=TMP/f'narration{i:02}.aiff'
    # Segment narration fits its window while retaining natural speech rhythm.
    rate=175
    for attempt in range(9):
        subprocess.run(['say','-v','Samantha','-r',str(rate),'-o',str(track),'-f',str(TMP/f'narration{i:02}.txt')],check=True)
        length=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(track)],text=True))
        if length<=end-start-.45:break
        rate+=14
    if length>end-start:raise RuntimeError(f'narration section {i} too long: {length:.2f}s for {end-start}s')
    tracks.append(track)
    print('narration',i+1,round(length,2),f'window {end-start}s',flush=True)
inputs=[]
for audio in tracks:inputs.extend(['-i',str(audio)])
filters=[]
for i,(start,end,_) in enumerate(voice_segments):filters.append(f'[{i}:a]aresample=48000,adelay={int(start*1000)}|{int(start*1000)}[v{i}]')
filters.append(''.join(f'[v{i}]' for i in range(len(tracks)))+f'amix=inputs={len(tracks)}:duration=longest:dropout_transition=0,apad,atrim=duration=90[out]')
audio=TMP/'narrated.m4a'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*inputs,'-filter_complex',';'.join(filters),'-map','[out]','-c:a','aac','-b:a','192k',str(audio)],check=True)
output=DEMO/'why-math-90s-demo.mp4'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(video),'-i',str(audio),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-t','90','-movflags','+faststart',str(output)],check=True)
actual=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size','-of','default=noprint_wrappers=1',str(output)],text=True).strip()
print('OUTPUT',output,actual,flush=True)
# A concise English script with human-editable timestamps.
script_lines=['# Why Math? — Fast-cut Product Demo (English narration)','',f'{len(shots)} raster scenes, 90 seconds. Student A/B are AI simulations, not human outcome claims.','', '| Time | English narration |','|---|---|']
for start,end,line in voice_segments:script_lines.append(f'| {start:02d}–{end:02d}s | {line} |')
script_lines+=['','## Visual editing rule','', 'All stills are rendered PNG rasters, sourced from actual app captures and PNG-composited educational assets. No SVG teaching illustrations are used. Fast cuts are matched to narration. Labels distinguish simulations from real students.']
(DEMO/'NARRATION.md').write_text('\n'.join(script_lines)+'\n')
