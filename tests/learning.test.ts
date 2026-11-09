import {describe,it,expect} from 'vitest';
import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {SessionStore} from '../server/store';
import {LessonService} from '../server/service';
import {safeArithmetic} from '../server/curriculum';
import {teach,safeTeaching} from '../server/teacher';

async function rig(){const dir=await mkdtemp(join(tmpdir(),'why-math-test-'));const path=join(dir,'sessions.json');const store=new SessionStore(path);return {store,path,service:new LessonService(store)}}
describe('Why Math core learning loop',()=>{
 it('starts teaching without learner question',async()=>{const {service}=await rig();const s=await service.create('kid','Learner','en','zero','offline-fallback');expect(s.messages[0].role).toBe('teacher');expect(s.messages[0].text).toContain('zero');expect(s.textbook).toHaveLength(1)});
 it('changes teaching actions for vocabulary and conceptual gaps',async()=>{const {service}=await rig();const a=await service.create('a','A','en','negative-numbers','offline-fallback');const b=await service.create('b','B','en','negative-numbers','offline-fallback');const x=await service.turn(a.id,'What does negative mean?','offline-fallback');const y=await service.turn(b.id,'I do not think that makes sense','offline-fallback');expect(x.action).toBe('define-term');expect(y.action).toBe('concrete-example');expect(x.session.messages.at(-1)?.text).not.toEqual(y.session.messages.at(-1)?.text)});
 it('stores student records separately, and supports reload',async()=>{const {service,store,path}=await rig();const a=await service.create('a','A','ko','zero','offline-fallback');const b=await service.create('b','B','en','zero','offline-fallback');await service.turn(a.id,'뜻이 뭐예요?','offline-fallback');expect(store.get(b.id)?.evidence).toHaveLength(0);const second=new SessionStore(path);await second.load();expect(second.get(a.id)?.evidence).toHaveLength(1);expect(second.get(b.id)?.evidence).toHaveLength(0)});
 it('does not mark textbook as evidenced from one vocabulary clarification',async()=>{const {service}=await rig();const a=await service.create('a','A','ko','zero','offline-fallback');const t=await service.turn(a.id,'단어의 뜻이 뭐예요?','offline-fallback');expect(t.session.textbook[0].status).toBe('exploring')});
 it('checks restricted arithmetic safely',()=>{expect(safeArithmetic('3-5')).toBe(-2);expect(safeArithmetic('2+7')).toBe(9);expect(safeArithmetic('alert(1)')).toBeNull()});
});

describe('mathematical misconception safety gate',()=>{
 const baseline={concept:'negative-numbers' as const,history:[],state:{vocabulary:0,concept:0,transfer:0,observations:[]},requestedMode:'offline-fallback' as const};
 it.each([
  ['en','-3 is bigger than -1 because 3 is bigger.'],
  ['ko','3이 1보다 크니까 -3이 -1보다 더 커요.']
 ] as const)('does not reward false comparison in %s',async(language,input)=>{
  const x=await teach({...baseline,language,input});
  expect(x.output.evidenceKind).toBe('misconception');
  expect(x.output.action).not.toBe('advance');
 });
 it('never interprets the literal phrase I understand as demonstrated mastery',async()=>{
  const x=await teach({...baseline,language:'en',input:'Yes, I understand.'});
  expect(x.output.action).not.toBe('advance');
 });
});

describe('LLM output guard and assertion-sensitive comparison',()=>{
 const ctx={concept:'negative-numbers' as const,history:[],state:{vocabulary:0,concept:0,transfer:0,observations:[]},requestedMode:'offline-fallback' as const};
 const forged={gap:'none' as const,action:'advance' as const,explanation:'You understand the rule.',question:'What is next?',observation:'Learner understood the topic.',evidenceKind:'correct' as const,textbookExplanation:'Mastered comparisons.',showNumberLine:false};
 it.each([
 ['en','-3 is bigger than -1 because 3 is bigger.'],
 ['ko','3이 1보다 크니까 -3이 -1보다 더 커요.'],
 ['en','-3 > -1'],
 ['ko','-3보다 -1이 작다']
 ] as const)('blocks an incorrect asserted comparison despite fake LLM advance (%s)',(language,input)=>{
   const result=safeTeaching({...ctx,language,input},forged);expect(result.evidenceKind).toBe('misconception');expect(result.action).not.toBe('advance');
 });
 it.each([
 ['en','Is -3 bigger than -1?'],['ko','-3이 -1보다 큰가요?'],['en','It is wrong that -3 is bigger than -1.']
 ] as const)('does not label questions or negations as misconceptions (%s)',(language,input)=>{
   const result=safeTeaching({...ctx,language,input},forged);expect(result.evidenceKind).not.toBe('misconception');
 });
});

describe('session privacy and persistence safety',()=>{
 it('requires a random capability and never exposes its hash in a public session',async()=>{
  const {store,service}=await rig(); const session=await service.create('demo','Demo','en','zero','offline-fallback');
  const token=await store.issueCapability(session.id);
  expect(token.length).toBeGreaterThan(30);
  expect(store.authorize(session.id,token)).toBe(true);
  expect(store.authorize(session.id,'not-the-token')).toBe(false);
  expect(store.authorize('unknown',token)).toBe(false);
  const {publicSession}=await import('../server/store');
  expect(JSON.stringify(publicSession(store.get(session.id)!))).not.toContain('accessHash');
  expect(JSON.stringify(publicSession(store.get(session.id)!))).not.toContain(token);
 });
 it('does not silently reset a corrupted session database',async()=>{
  const {store,path}=await rig();await writeFile(path,'{invalid json');
  await expect(store.load()).rejects.toThrow('corrupted');
 });
 it('serializes concurrent writes and keeps parseable snapshots',async()=>{
  const {store,path,service}=await rig();
  const sessions=await Promise.all(Array.from({length:8},(_,i)=>service.create(`student-${i}`,`Student ${i}`,'en','zero','offline-fallback')));
  const loaded=JSON.parse(await readFile(path,'utf8'));
  expect(loaded).toHaveLength(8);
  await Promise.all([service.turn(sessions[0].id,'What does negative mean?','offline-fallback'),service.turn(sessions[0].id,'Why is zero a number?','offline-fallback')]);
  expect(store.get(sessions[0].id)?.messages).toHaveLength(5);
 });
});

describe('guided lesson start matches selected concept',()=>{
 it('introduces the number line without an unrelated negative-number lecture',async()=>{
  const {service}=await rig(); const session=await service.create('student','Learner','en','number-line','offline-fallback');
  expect(session.messages[0].text.toLowerCase()).toContain('number line');
  expect(session.messages[0].text).not.toContain('Where have you seen a number below zero');
 });
});

describe('credential database integrity',()=>{
 it('rejects a malformed access hash rather than crash on verification',async()=>{
  const {store,path,service}=await rig(); const session=await service.create('test','Test','en','zero','offline-fallback');
  const records=JSON.parse(await readFile(path,'utf8'));records[0].accessHash='not-hex';await writeFile(path,JSON.stringify(records));
  const reload=new SessionStore(path);await expect(reload.load()).rejects.toThrow('invalid');
  expect(store.authorize(session.id,'something')).toBe(false);
 });
 it('legacy records remain inaccessible even if a session ID is known',async()=>{
  const {store,service}=await rig();const session=await service.create('legacy','Legacy','en','zero','offline-fallback');
  expect(store.authorize(session.id,'any-credential')).toBe(false);
 });
});

describe('simulation mode data contract',()=>{
 it('normal students are not fixture sessions',async()=>{
  const {service}=await rig();const human=await service.create('human-test','Human','en','zero','offline-fallback');
  expect(human.isFixture).toBe(false);
 });
 it('test fixtures are explicit and isolated',async()=>{
  const {service}=await rig();const student=await service.create('learner-a','Test Student','en','zero','offline-fallback',true);
  expect(student.isFixture).toBe(true);
 });
});

describe('questions and uncertainty are not errors',()=>{
 const ctx={concept:'zero' as const,history:[],state:{vocabulary:0,concept:0,transfer:0,observations:[]},language:'en' as const};
 it('does not record misconception from a genuine question even if model asserts one',()=>{
  const model={gap:'concept' as const,action:'concrete-example' as const,explanation:'Zero is a number.',question:'Can you count empty boxes?',observation:'Incorrect response.',evidenceKind:'misconception' as const,textbookExplanation:'Zero.',showNumberLine:false};
  expect(safeTeaching({...ctx,input:'What does zero mean exactly?'},model).evidenceKind).toBe('observation');
  expect(safeTeaching({...ctx,input:'I do not know.'},model).evidenceKind).toBe('observation');
  expect(safeTeaching({...ctx,language:'ko',input:'0은 무슨 뜻인가요?'},model).evidenceKind).toBe('observation');
 });
});
