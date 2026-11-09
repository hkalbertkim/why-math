import { randomUUID } from 'node:crypto';
import type { ConceptId, Language, Session, SourceMode, TurnResult } from '../src/types.js';
import { curriculum, titleFor } from './curriculum.js';
import { SessionStore } from './store.js';
import { teach } from './teacher.js';
const now = () => new Date().toISOString();

export class LessonService {
  private turns = new Map<string, Promise<unknown>>();
  constructor(public store: SessionStore) {}
  // Serialize a learner's turns so concurrent model responses do not overwrite earlier turns.
  private async serialize<T>(id: string, task: () => Promise<T>): Promise<T> {
    const prior = this.turns.get(id) ?? Promise.resolve();
    const next = prior.catch(() => undefined).then(task);
    this.turns.set(id, next);
    try { return await next; }
    finally { if (this.turns.get(id) === next) this.turns.delete(id); }
  }
  async create(learnerId: string, learnerLabel: string, language: Language, concept: ConceptId = 'negative-numbers', mode?: SourceMode, isFixture=false) {
    const id = randomUUID(); const intros={
      zero:{ko:'오늘은 0이 왜 중요한 수인지 함께 알아볼게요. 사과가 하나도 없다면 몇 개라고 말할까요?',en:'Let’s explore the number zero. If a basket has no apples, how many apples are there?'},
      'number-line':{ko:'오늘은 수직선이 무엇인지 알아볼게요. 숫자들이 선 위의 각 위치에 놓일 수 있다는 것을 알고 있나요?',en:'Today we will explore the number line. Did you know every number can mark a position along a line?'},
      'negative-numbers':{ko:'오늘은 음수가 어디에 있고 왜 필요한지 알아볼게요. 0보다 작은 수를 본 적이 있나요?',en:'Today we’ll explore where negative numbers live and why we need them. Where have you seen a number below zero?'}
    } as const; const intro=intros[concept][language];
    const session: Session = { id, learnerId, learnerLabel, isFixture, language, concept, mode: mode ?? 'offline-fallback', messages:[{id:randomUUID(),role:'teacher',text:intro,action:'teacher-start',createdAt:now()}], evidence:[], textbook:[{id:randomUUID(),concept,title:titleFor(concept,language),fact:(language==='ko'?curriculum[concept].koFacts:curriculum[concept].facts)[0],explanation:language==='ko'?'대화를 시작했어요. 이해의 증거를 모으는 중입니다.':'Lesson started. Gathering evidence of understanding.',status:'exploring',evidence:language==='ko'?'아직 확인된 답변 없음':'No response assessed yet',updatedAt:now()}], state:{vocabulary:0,concept:0,transfer:0,observations:[]}, showNumberLine:true, updatedAt:now() };
    await this.store.save(session); return session;
  }
  async setLanguage(id: string, language: Language): Promise<Session> {
    return this.serialize(id, async () => {
      const session=this.store.get(id);
      if (!session) throw new Error('Session not found');
      session.language=language;
      for(const entry of session.textbook){
        entry.title=titleFor(entry.concept,language);
        entry.fact=(language==='ko'?curriculum[entry.concept].koFacts:curriculum[entry.concept].facts)[0];
      }
      session.updatedAt=now();
      await this.store.save(session);
      return session;
    });
  }
  async turn(id: string, input: string, requestedMode?: SourceMode): Promise<TurnResult> {
    return this.serialize(id, async () => {
    const session = this.store.get(id); if (!session) throw new Error('Session not found');
    session.messages.push({id:randomUUID(),role:'learner',text:input,createdAt:now()});
    const result = await teach({ language:session.language, concept:session.concept, input, history:session.messages, state:session.state, requestedMode }); const o=result.output;
    session.messages.push({id:randomUUID(),role:'teacher',text:`${o.explanation}\n\n${o.question}`,action:o.action,createdAt:now()});
    session.evidence.push({id:randomUUID(),concept:session.concept,kind:o.evidenceKind,text:o.observation,createdAt:now()});
    const delta = o.evidenceKind === 'correct' ? 1 : 0; session.state.vocabulary += o.gap==='vocabulary'?0:delta; session.state.concept += o.gap==='concept'?0:delta; session.state.transfer += (o.action==='advance' && o.evidenceKind==='correct' && session.evidence.filter(e=>e.kind==='correct').length>=2)?1:0; session.state.observations.push(o.observation);
    const entry=session.textbook[0]; entry.explanation=o.textbookExplanation; entry.evidence=o.observation; entry.status=session.state.transfer>0?'evidenced':session.evidence.length>1?'developing':'exploring'; entry.updatedAt=now();
    session.showNumberLine=o.showNumberLine; session.mode=result.source; session.updatedAt=now(); await this.store.save(session);
    return {session,gap:o.gap,action:o.action,source:result.source,notice:result.notice};
    });
  }
}
