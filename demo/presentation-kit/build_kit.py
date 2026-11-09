from pathlib import Path
import json, subprocess, math, re, textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[2]
KIT=ROOT/'demo/presentation-kit'; ASSETS=KIT/'assets'; AUDIO=KIT/'audio'; PLACEHOLDERS=KIT/'capture-slots'
for d in [KIT,ASSETS,AUDIO,PLACEHOLDERS]:d.mkdir(parents=True,exist_ok=True)
W,H=1920,1080
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'; BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
def font(n,b=False):return ImageFont.truetype(BOLD if b else FONT,n)

def canvas():
    img=Image.new('RGB',(W,H),(18,43,35)); pix=img.load()
    # Fully rasterized, no SVG or mock UI; subtle dark gradient with natural glow.
    for y in range(H):
        for x in range(W):
            t=x/W*.30+y/H*.7; v=max(0,1-math.hypot((x-W*.80)/W,(y-H*.30)/H))
            pix[x,y]=(int(14+14*t+7*v),int(41+19*t+11*v),int(33+10*t+9*v))
    return img

def draw_textbox(draw,text,x,y,size,maxwidth,fill=(245,248,238),bold=True,line_height=1.25):
    f=font(size,bold); words=text.split(); lines=[];line=''
    for word in words:
        nxt=(line+' '+word).strip()
        if draw.textbbox((0,0),nxt,font=f)[2]>maxwidth and line:
            lines.append(line);line=word
        else:line=nxt
    if line:lines.append(line)
    for li in lines:
        draw.text((x,y),li,font=f,fill=fill,stroke_width=0);y+=int(size*line_height)
    return y

def title_card(name,eyebrow,headline,sub,footer):
    img=canvas();d=ImageDraw.Draw(img)
    lime=(215,240,113);green=(114,185,157)
    label=eyebrow.upper(); label_width=int(d.textlength(label,font=font(25,True)))+42
    d.rounded_rectangle((115,98,115+label_width,153),radius=20,fill=lime)
    d.text((135,110),label,font=font(25,True),fill=(18,43,35))
    y=draw_textbox(d,headline,120,325,115,1660,fill=(249,250,246))
    draw_textbox(d,sub,126,y+46,43,1500,fill=(198,221,204),bold=False,line_height=1.35)
    d.line((120,956,1800,956),fill=green,width=2)
    d.text((125,990),footer,font=font(28,False),fill=lime)
    img.save(ASSETS/f'{name}.png',optimize=True)

# Only two designed title cards. All teaching proof must come from actual UI recordings.
title_card('opening','the question','Why should every student learn the same way?','Every mind learns differently. The lesson should too.','WHY MATH?  /  THE PRIMER  /  2026')
title_card('ending','why math?','The lesson adapts to you.','Same mathematics. Different paths to understanding.','EXPLORE THE DEMO  /  github.com/hkalbertkim/why-math')

def overlay(name,label,detail,width=1100):
    img=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(img)
    # Lower third only, so actual app remains dominant.
    x,y=78,835
    d.rounded_rectangle((x,y,x+width,y+145),radius=22,fill=(12,38,31,230),outline=(121,180,148,90),width=2)
    d.rounded_rectangle((x+20,y+21,x+35,y+122),radius=6,fill=(212,244,112,255))
    d.text((x+63,y+17),label,font=font(43,True),fill=(247,250,243,255))
    d.text((x+65,y+87),detail,font=font(26,False),fill=(197,231,204,255))
    img.save(ASSETS/f'{name}.png',optimize=True)

for item in [
 ('teacher','THE TEACHER STARTS','No perfect question required'),
 ('student_a','STUDENT A · SIMULATED','Same age · vocabulary gap'),
 ('student_b','STUDENT B · SIMULATED','Same age · different misconception'),
 ('comparison','ONE TEACHER. DIFFERENT PATHS.','Two independent AI test learners'),
 ('korean','THE LESSON CONTINUES IN KOREAN','The same learner record is preserved'),
 ('visual','MAKE THE IDEA TANGIBLE','The count changes when you add or remove an apple'),
 ('textbook','A LIVING TEXTBOOK','Explanations and open questions update automatically')]:overlay(*item)

# A precise edit plan. Every SLOT marked capture is intentionally blank until real capture.
shots=[
 (0.0,2.6,'ART_OPEN','opening',None,'Open in 2.6 seconds; no ten-second logo hold'),
 (2.6,9.0,'CAPTURE','home_and_start','teacher','Actual home screen, click Start with zero, teacher opens'),
 (9.0,13.0,'CAPTURE','guided_start','teacher','Teacher-first lesson begins, no learner prompt'),
 (13.0,18.0,'CAPTURE','teacher_question','teacher','Zoom into real teacher question and composer'),
 (18.0,23.0,'CAPTURE','learner_a_question','student_a','Student A simulated answer typed/auto responded, no fabricated dialog'),
 (23.0,28.0,'CAPTURE','learner_a_teacher','student_a','Actual generated teacher explanation; show adaptive action'),
 (28.0,33.0,'CAPTURE','learner_b_question','student_b','Independent B session with same start; reveals different gap'),
 (33.0,37.0,'CAPTURE','learner_b_teacher','student_b','Teacher response and action differs; no age-based preset'),
 (37.0,41.0,'CAPTURE','live_ab_split','comparison','Side-by-side two real screen recordings, not app-mimicking graphic'),
 (41.0,47.0,'CAPTURE','korean_live','korean','Change language and show actual Korean response; allow edit speed-up'),
 (47.0,51.0,'CAPTURE','apple_add','visual','Live PNG apple counter: 0→1→2; cursor visible'),
 (51.0,55.0,'CAPTURE','apple_remove','visual','Actual click remove: 2→1→0, end on zero'),
 (55.0,60.0,'CAPTURE','living_textbook_a','textbook','Real learner A textbook and observation, no mastery claims'),
 (60.0,65.0,'CAPTURE','living_textbook_b','textbook','Real learner B textbook; compare evidence, not outcome score'),
 (65.0,69.0,'CAPTURE','app_close','comparison','Actual app main interface with two learner paths; GitHub CTA narration'),
 (69.0,72.0,'ART_END','ending',None,'Short CTA card; final real app capture can precede it')
]
assert sum(b-a for a,b,*_ in shots)==72
assert shots[0][0]==0 and shots[-1][1]==72
with (KIT/'edit-plan.json').open('w') as f:json.dump({'duration_seconds':72,'canvas':'1920x1080','fps':30,'rule':'Only ARTS are authored raster cards. CAPTURE shots require real browser video; NEVER substitute screenshots or synthetic UI.','shots':[{'start':a,'end':b,'type':t,'id':id,'overlay':ov,'action':desc} for a,b,t,id,ov,desc in shots]},f,ensure_ascii=False,indent=2)

lines=['# Why Math? — Live browser video edit plan','','**Duration: 72 seconds (under the 90-second limit).** Only two raster title cards are authored. The other 14 segments must be actual recorded browser interactions.','', '| Time | Source | Screen direction |','|---|---|---|']
for a,b,t,id,ov,desc in shots:
    lines.append(f'| {a:04.1f}–{b:04.1f}s | {"PNG title card" if t.startswith("ART") else "LIVE browser recording"} | {desc} |')
lines.extend(['','## Capture rules','','- Capture the working local app at `http://localhost:5173` through the authenticated SSH tunnel on MP, or directly on MSM2-1.','- Record genuine clicks, typing, generation indicators, final model replies and textbook updates. The timeline may speed up model waiting, but must not fabricate what the app did.','- For two students, record separate real sessions and split-screen their captured video only. Clearly mark both as AI simulations.','- Show the actual PNG counting control interaction (0→1→2→1→0) in the running app. Do not use fake PNG overlays to simulate a working app.','- The two supplied title cards are the only non-UI full-frame designs. The seven transparent lower-thirds are optional overlays on actual recordings.','- If a generation step fails, state or omit it. Never use the deterministic fallback and call it a live model response.','- Do not show invented learning gains or claim proven student mastery.','', '## Missing capture slots','','The slot identifiers above are also placeholder filenames to provide to the final render assembly (`capture-slots/<id>.mp4`). Empty until real browser footage is captured.'])
(KIT/'EDIT_PLAN.md').write_text('\n'.join(lines)+'\n')
for a,b,t,id,ov,desc in shots:
    if t=='CAPTURE':
        (PLACEHOLDERS/f'{id}.md').write_text(f'# {id}\n\nTime: {a:.1f}–{b:.1f} s\n\nActual browser video required: {desc}\n\nExpected file: `{id}.mp4`\n\nNo video has been substituted or fabricated.\n')

# Compose complete 72-second approved speech track from 7 existing MP3 stems.
voice=ROOT/'demo/audio'
for i in range(7):
    assert (voice/f'seg{i}.mp3').exists(),f'missing voice stem {i}'
starts=[0,9,18,37,47,55,65]
filters=[f'[{i}:a]aresample=48000,adelay={st*1000}|{st*1000}[v{i}]' for i,st in enumerate(starts)]
filters.append(''.join(f'[v{i}]' for i in range(7))+'amix=inputs=7:duration=longest:dropout_transition=0,apad,atrim=duration=72,alimiter=limit=0.92[voice]')
inputs=[]
for i in range(7):inputs.extend(['-i',str(voice/f'seg{i}.mp3')])
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*inputs,'-filter_complex',';'.join(filters),'-map','[voice]','-ar','48000','-c:a','aac','-b:a','192k',str(AUDIO/'why-math-narration-72s.m4a')],check=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(AUDIO/'why-math-narration-72s.m4a'),'-c:a','pcm_s16le',str(AUDIO/'why-math-narration-72s.wav')],check=True)

# Approved captions: clause timing anchored to detected real pauses in the seven final speech stems.
# This is NOT estimated by simply dividing words into a 72-second timeline.
import json
caption_data=json.loads((KIT/'captions.aligned.json').read_text())
entries=[(x['start'],x['end'],x['text']) for x in caption_data['cues']]
def tstamp(secs,srt=True):
    ms=round(secs*1000);h=ms//3600000;m=(ms//60000)%60;s=(ms//1000)%60;ml=ms%1000
    return f'{h:02}:{m:02}:{s:02}{"," if srt else "."}{ml:03}'
def two_lines(text,maxchars=42):
    words=text.split();parts=[];current=''
    for word in words:
        nxt=(current+' '+word).strip()
        if len(nxt)>maxchars and current:parts.append(current);current=word
        else:current=nxt
    if current:parts.append(current)
    if len(parts)>2:raise ValueError(f'Subtitle too long for two lines: {text}')
    return '\n'.join(parts)
srt=[];vtt=['WEBVTT','']
for i,(a,b,unit) in enumerate(entries,1):
    display=two_lines(unit)
    if b-a<1.2:raise ValueError(f'Short subtitle cue {i}: {b-a:.2f}s')
    if (len(unit)/(b-a))>25.5:raise ValueError(f'Fast subtitle cue {i}: {len(unit)/(b-a):.1f}cps')
    srt.extend([str(i),f'{tstamp(a)} --> {tstamp(b)}',display,''])
    vtt.extend([f'{tstamp(a,False)} --> {tstamp(b,False)}',display,''])
(KIT/'captions.en.srt').write_text('\n'.join(srt))
(KIT/'captions.en.vtt').write_text('\n'.join(vtt))

# Separate compact English pitch and event-form copy, not overclaiming the technical scope.
(KIT/'PITCH.md').write_text('''# Why Math? — Pitch and submission copy\n\n## Five-second hook\n\nEducation has always asked students to adapt to the lesson. It is time for the lesson to adapt to the student.\n\n## 20-second pitch (English)\n\nWhy Math? is an AI-led mathematics tutor that starts the lesson without requiring a learner to ask the perfect question. It observes how the learner responds, then changes its next explanation, example, or question. A Living Textbook records the learning conversation automatically.\n\n## 60-second live intro (English)\n\nThink about the last time you memorized a formula without understanding why it worked. Most classrooms have one explanation and many different minds. If a learner misses the meaning of the words, they may not even know what to ask. Why Math starts with the teacher, listens to the learner, and chooses a new explanation based on that conversation. To test the engine, we use two simulated fourteen-year-olds with different misconceptions. Their profiles are hidden from the teacher. What you see next is the actual app: two different student answers, two different teaching actions, and an automatically updated Living Textbook. This is an early prototype of the teaching loop, not proof of improved human learning outcomes.\n\n## Event form: project name\n\nWhy Math?\n\n## Event form: one-liner\n\nAn AI teacher that adapts the explanation to the learner — rather than forcing the learner to adapt to the lesson.\n\n## Event form: short description\n\nWhy Math? is an AI-led, bilingual mathematics learning prototype. Learners can follow a guided concept path or begin through conversation. The AI teacher takes the initiative, observes responses and uncertainty, and adapts its next explanation and teaching action. An individual Living Textbook updates automatically. The hackathon demonstration uses two simulated students of the same age to test different gaps in understanding, a small implemented concept chain (zero, number lines and negative numbers), and a PNG-based interactive counting activity. It does not claim measured learning gains.\n\n## Evidence, not claims\n\n- Actual AI Teacher sessions can be shown live in English or Korean.\n- The two simulated test learners use one shared teacher engine; their hidden test profiles are not passed to the teacher.\n- Recorded examples are software test evidence, not a controlled educational study.\n- Living Textbook records explanations and observations, not general mastery.\n- Broad curriculum coverage and education efficacy are not yet established.\n''')
(KIT/'PRESENTER_NOTES.md').write_text('''# Presenter notes — live demo handoff\n\n## Before recording\n\n1. Confirm local web app and API health, and that Ollama is running.\n2. Use a fresh browser profile or known test session. Clear prior demo session only in that profile; do not modify unrelated user data.\n3. Capture at 1920x1080 if possible, 30fps. Keep the cursor visible, but hide OS notifications.\n4. Enable the explicit simulation test mode before showing a simulated learner. Do not display internal test instructions.\n5. Record genuine Teacher and Student Agent output and include the generation delay; speeding up idle waiting during editing is allowed.\n6. Capture Korean language switch in the same session and a real new Korean teacher answer.\n7. Capture actual Add/Remove click sequence 0 → 1 → 2 → 1 → 0.\n8. Record Living Textbook as the last software proof.\n\n## In case of failure\n\n- Do not pretend a timed-out model output was live. Either show the failure honestly or omit the clip.\n- Never replace a missing UI clip with a styled app screenshot or fake animated UI.\n- The two full-screen PNG assets (`opening.png`, `ending.png`) are for editorial opening and closing only.\n\n## Voice direction (approved)\n\nBalanced expressive storyteller: natural, confident, moderately energetic; emphasize "adapt", "different" and the final brand name. No exaggerated announcer shouting. Original MP3 stems are stored under `../audio/`.\n\n## Do not claim\n\n- Proven educational improvement or higher math scores\n- A complete mathematics curriculum\n- Full mathematical accuracy across arbitrary topics\n- That simulated learners were actual human students\n''')

# Additional artifact validation
for f in ['opening.png','ending.png','teacher.png','student_a.png','student_b.png','comparison.png','korean.png','visual.png','textbook.png']:
    assert (ASSETS/f).is_file()
print('KIT',KIT)
print('ASSETS',len(list(ASSETS.glob('*.png'))),'CAPTURE PLACEHOLDERS',len(list(PLACEHOLDERS.glob('*.md'))),'CAPTIONS',len(entries))
for audio in (AUDIO/'why-math-narration-72s.m4a',AUDIO/'why-math-narration-72s.wav'):
    meta=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size','-of','default=noprint_wrappers=1',str(audio)],text=True).strip().replace('\n',' ')
    print(audio.name,meta)
