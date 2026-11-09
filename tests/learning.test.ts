import {describe,it,expect} from 'vitest';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {SessionStore} from '../server/store';
import {LessonService} from '../server/service';
import {safeArithmetic} from '../server/curriculum';
import {teach,safeTeaching} from '../server/teacher';

async function rig(){const dir=await mkdtemp(join(tmpdir(),'why-math-test-'));const path=join(dir,'sessions.json');const store=new SessionStore(path);return {store,path,service:new LessonService(store)}}
describe('Why Math core learning loop',()=>{
 it('starts teaching without learner question',async()=>{const {service}=await rig();const s=await service.create('kid','Learner','en','zero','offline-fallback');expect(s.messages[0].role).toBe('teacher');expect(s.textbook).toHaveLength(1)});
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
