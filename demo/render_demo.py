#!/usr/bin/env python3
"""Render a 90-second English-narrated hackathon video from ACTUAL app screenshots.
Requires macOS say, ffmpeg, ffprobe and Pillow. No private user data or AI claims are simulated as real-world learning evidence.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import subprocess, math, os

ROOT=Path(__file__).resolve().parents[1]
DEMO=ROOT/'demo'
WORK=Path('/tmp/why-math-video-work')
WORK.mkdir(parents=True,exist_ok=True)
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
if not Path(BOLD).exists():BOLD=FONT

def font(size,bold=False):return ImageFont.truetype(BOLD if bold else FONT,size)

def gradient():
    im=Image.new('RGB',(1280,720))
    px=im.load()
    for y in range(720):
        for x in range(1280):
            t=x/1280*.5+y/720*.5
            px[x,y]=(int(13+22*t),int(45+51*t),int(37+35*t))
    d=ImageDraw.Draw(im,'RGBA')
    for i in range(7):
        r=100+i*75
        d.ellipse((950-r,340-r,950+r,340+r),outline=(184,219,185,20),width=3)
    return im

def hero(i,title,subtitle,foot):
    im=gradient();d=ImageDraw.Draw(im)
    d.rounded_rectangle((75,65,185,175),radius=28,fill=(216,241,88))
    d.text((107,82),'?',font=font(68,True),fill=(14,50,41))
    d.text((78,220),title,font=font(68,True),fill=(249,250,246))
    d.text((81,325),subtitle,font=font(28),fill=(217,231,218))
    d.line((80,575,1200,575),fill=(120,164,135),width=2)
    d.text((80,603),foot,font=font(22),fill=(217,241,88))
    im.save(WORK/f'slide{i:02}.png')

def screenshot(i,src,heading,caption):
    im=Image.open(src).convert('RGB')
    screen=ImageOps.fit(im,(1280,622),method=Image.Resampling.LANCZOS,centering=(0.5,0.14))
    out=Image.new('RGB',(1280,720),(17,48,39));out.paste(screen,(0,0));d=ImageDraw.Draw(out)
    d.rectangle((0,620,1280,720),fill=(17,48,39))
    d.text((47,640),heading.upper(),font=font(24,True),fill=(216,241,88))
    d.text((48,678),caption,font=font(17),fill=(230,240,235))
    out.save(WORK/f'slide{i:02}.png')

slides=[
 (10,'Millions of students are taught the same lesson at the same pace. Those who do not understand are expected to catch up. Why Math reverses that expectation.'),
 (12,"Our AI teacher starts with a basic math concept. No perfectly worded question required. The student responds, and the teacher chooses what to explain next."),
 (14,'This is student A, a simulated fourteen-year-old learner who struggles with mathematical vocabulary. The teacher sees the student response, not the hidden test profile or misconception labels.'),
 (14,'Student B is the same age but has a different difficulty. The same teacher engine responds differently, finding examples that fit the conversation. These are simulations, not human learning outcomes.'),
 (13,'Why Math works in Korean too. A learner asks why zero is a number. The teacher explains, while the record marks the question as an observation, not a failure.'),
 (10,'Learning can be visual and interactive. Here, students add and remove apples to see quantity change. At zero, an empty basket still has a number.'),
 (8,'The Living Textbook writes itself, recording lesson explanations, student observations, and questions that the system still needs to check.'),
 (9,'One teacher. Different paths to understanding. Try Why Math. Explore the working prototype and code on GitHub today.')
]
hero(0,'Why Math?','The lesson adapts to you.','c0mpiled-17 Seoul  |  The Primer  |  November 2026')
screenshot(1,ROOT/'docs/screenshots/why-math-desktop.png','AI-LED LEARNING','Real app capture · The teacher begins the lesson')
screenshot(2,DEMO/'captures/student-a.png','LEARNER A · VOCABULARY GAP','AI student simulation · Real local Ollama teacher response')
screenshot(3,DEMO/'captures/student-b.png','LEARNER B · DIFFERENT GAP','Same teacher engine · Different student response')
screenshot(4,DEMO/'captures/korean.png','KOREAN LESSON','Real Korean-language Ollama response · Question recorded as observation')
screenshot(5,ROOT/'docs/screenshots/why-math-counting-two.png','PLAY TO UNDERSTAND','Raster PNG background + transparent PNG elements, not SVG illustration')
screenshot(6,DEMO/'captures/student-a.png','A LIVING TEXTBOOK','Lesson explanations, observations, and open questions appear automatically')
hero(7,'The lesson adapts','to the student.','Explore the demo  |  github.com/hkalbertkim/why-math')

lines=[]
for i,(duration,words) in enumerate(slides):
    narration=WORK/f'voice{i:02}.txt';narration.write_text(words+'\n')
    audio=WORK/f'voice{i:02}.aiff'
    subprocess.run(['say','-v','Samantha','-r','200' if i==6 else '150','-o',str(audio),'-f',str(narration)],check=True)
    clip=WORK/f'clip{i:02}.mp4'
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-framerate','25','-i',str(WORK/f'slide{i:02}.png'),'-i',str(audio),'-af','apad','-t',str(duration),'-r','25','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',str(clip)]
    subprocess.run(cmd,check=True)
    lines.append(f"file '{clip}'")
    print(f'clip {i+1}/8: {duration}s',flush=True)
listpath=WORK/'clips.txt';listpath.write_text('\n'.join(lines)+'\n')
out=DEMO/'why-math-90s-demo.mp4'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listpath),'-c','copy','-movflags','+faststart',str(out)],check=True)
duration=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(out)],text=True).strip()
print(f'OUTPUT {out} duration={duration}s size={out.stat().st_size}',flush=True)
