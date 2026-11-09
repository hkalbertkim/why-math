import {describe,it,expect} from 'vitest';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {SessionStore} from '../server/store';
import {LessonService} from '../server/service';
import {safeArithmetic} from '../server/curriculum';

async function rig(){const dir=await mkdtemp(join(tmpdir(),'why-math-test-'));const path=join(dir,'sessions.json');const store=new SessionStore(path);return {store,path,service:new LessonService(store)}}
describe('Why Math core learning loop',()=>{
 it('starts teaching without learner question',async()=>{const {service}=await rig();const s=await service.create('kid','Learner','en','zero','offline-fallback');expect(s.messages[0].role).toBe('teacher');expect(s.textbook).toHaveLength(1)});
 it('changes teaching actions for vocabulary and conceptual gaps',async()=>{const {service}=await rig();const a=await service.create('a','A','en','negative-numbers','offline-fallback');const b=await service.create('b','B','en','negative-numbers','offline-fallback');const x=await service.turn(a.id,'What does negative mean?','offline-fallback');const y=await service.turn(b.id,'I do not think that makes sense','offline-fallback');expect(x.action).toBe('define-term');expect(y.action).toBe('concrete-example');expect(x.session.messages.at(-1)?.text).not.toEqual(y.session.messages.at(-1)?.text)});
 it('stores student records separately, and supports reload',async()=>{const {service,store,path}=await rig();const a=await service.create('a','A','ko','zero','offline-fallback');const b=await service.create('b','B','en','zero','offline-fallback');await service.turn(a.id,'뜻이 뭐예요?','offline-fallback');expect(store.get(b.id)?.evidence).toHaveLength(0);const second=new SessionStore(path);await second.load();expect(second.get(a.id)?.evidence).toHaveLength(1);expect(second.get(b.id)?.evidence).toHaveLength(0)});
 it('does not mark textbook as evidenced from one vocabulary clarification',async()=>{const {service}=await rig();const a=await service.create('a','A','ko','zero','offline-fallback');const t=await service.turn(a.id,'단어의 뜻이 뭐예요?','offline-fallback');expect(t.session.textbook[0].status).toBe('exploring')});
 it('checks restricted arithmetic safely',()=>{expect(safeArithmetic('3-5')).toBe(-2);expect(safeArithmetic('2+7')).toBe(9);expect(safeArithmetic('alert(1)')).toBeNull()});
});
