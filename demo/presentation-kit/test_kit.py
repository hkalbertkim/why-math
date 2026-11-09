#!/usr/bin/env python3
"""Read-only validation of presentation assets and timeline, without real app UI footage."""
from pathlib import Path
import json,re,subprocess
from PIL import Image
KIT=Path(__file__).resolve().parent
plan=json.loads((KIT/'edit-plan.json').read_text())
shots=plan['shots']
assert plan['duration_seconds']==72
assert len(shots)==16
assert sum(s['type']=='CAPTURE' for s in shots)==14
assert sum(s['type']!='CAPTURE' for s in shots)==2
assert all(s['start']<s['end'] for s in shots)
assert shots[0]['start']==0 and shots[-1]['end']==72
assert all(abs(a['end']-b['start'])<.00001 for a,b in zip(shots,shots[1:]))
assert not list((KIT/'capture-slots').glob('*.mp4')), 'Real UI footage must not be fabricated during kit production'
for s in shots:
    if s['type']=='CAPTURE':assert (KIT/'capture-slots'/f"{s['id']}.md").exists()
for p in (KIT/'assets').glob('*.png'):
    with Image.open(p) as img:
        assert img.size==(1920,1080),(p,img.size)
        if p.stem not in ['opening','ending']:assert img.mode=='RGBA',f'Overlay must preserve transparency: {p}'
for name,target in [('opening.mp4',2.6),('ending.mp4',3.0)]:
    raw=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(KIT/'assets'/name)],text=True)
    assert abs(float(raw)-target)<.05,(name,raw)
for name in ['why-math-narration-72s.m4a','why-math-narration-72s.wav']:
    raw=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(KIT/'audio'/name)],text=True)
    assert abs(float(raw)-72)<.1,(name,raw)
assert len(re.findall(r'\d\d:\d\d:\d\d,\d\d\d --> ',(KIT/'captions.en.srt').read_text()))==28
aligned=json.loads((KIT/'captions.aligned.json').read_text())['cues']
assert len(aligned)==28
assert all(x['end']-x['start']>=1.19 for x in aligned)
assert all(len(x['text'])/(x['end']-x['start'])<25.5 for x in aligned)
assert all(a['end']<=b['start'] for a,b in zip(aligned,aligned[1:]))
assert (KIT/'captions.en.vtt').read_text().startswith('WEBVTT')
assert all((KIT/name).exists() for name in ['PITCH.md','JUDGE_QA.md','PRESENTER_NOTES.md','EDIT_PLAN.md','README.md','render_final.py','build_kit.py'])
# Final renderer is expected to refuse fake live video, and to list missing slots.
r=subprocess.run(['python3',str(KIT/'render_final.py')],capture_output=True,text=True)
assert r.returncode==2,(r.returncode,r.stdout,r.stderr)
assert 'No fake or frozen UI footage' in r.stdout
print('PRESENTATION KIT QC PASS: 72-second audio, 16 contiguous segments, 14 absent actual-UI slots, 2 real raster cards, 7 transparent PNG labels, 28 pause-aligned subtitles, strict assembly gate')
