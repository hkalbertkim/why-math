import { randomUUID } from 'node:crypto';
import type { ConceptId, Language, Session, SourceMode, TurnResult } from '../src/types.js';
import { curriculum, titleFor } from './curriculum.js';
import { SessionStore } from './store.js';
import { teach } from './teacher.js';
const now = () => new Date().toISOString();

export class LessonService {
  constructor(public store: SessionStore) {}
  async create(learnerId: string, learnerLabel: string, language: Language, concept: ConceptId = 'negative-numbers', mode?: SourceMode) {
    const id = randomUUID(); const intro = language === 'ko' ? '오늘은 음수가 어디에 있고 왜 필요한지 알아볼게요. 0보다 작은 수를 본 적이 있나요?' : 'Today we’ll explore where negative numbers live and why we need them. Where have you seen a number below zero?';
    const session: Session = { id, learnerId, learnerLabel, language, concept, mode: mode ?? 'offline-fallback', messages:[{id:randomUUID(),role:'teacher',text:intro,action:'teacher-start',createdAt:now()}], evidence:[], textbook:[{id:randomUUID(),concept,title:titleFor(concept,language),fact:(language==='ko'?curriculum[concept].koFacts:curriculum[concept].facts)[0],explanation:language==='ko'?'대화를 시작했어요. 이해의 증거를 모으는 중입니다.':'Lesson started. Gathering evidence of understanding.',status:'exploring',evidence:language==='ko'?'아직 확인된 답변 없음':'No response assessed yet',updatedAt:now()}], state:{vocabulary:0,concept:0,transfer:0,observations:[]}, showNumberLine:true, updatedAt:now() };
    await this.store.save(session); return session;
  }
  async turn(id: string, input: string, requestedMode?: SourceMode): Promise<TurnResult> {
    const session = this.store.get(id); if (!session) throw new Error('Session not found');
    session.messages.push({id:randomUUID(),role:'learner',text:input,createdAt:now()});
    const result = await teach({ language:session.language, concept:session.concept, input, history:session.messages, state:session.state, requestedMode }); const o=result.output;
    session.messages.push({id:randomUUID(),role:'teacher',text:`${o.explanation}\n\n${o.question}`,action:o.action,createdAt:now()});
    session.evidence.push({id:randomUUID(),concept:session.concept,kind:o.evidenceKind,text:o.observation,createdAt:now()});
    const delta = o.evidenceKind === 'correct' ? 1 : 0; session.state.vocabulary += o.gap==='vocabulary'?0:delta; session.state.concept += o.gap==='concept'?0:delta; session.state.transfer += (o.action==='advance' && o.evidenceKind==='correct' && session.evidence.filter(e=>e.kind==='correct').length>=2)?1:0; session.state.observations.push(o.observation);
    const entry=session.textbook[0]; entry.explanation=o.textbookExplanation; entry.evidence=o.observation; entry.status=session.state.transfer>0?'evidenced':session.evidence.length>1?'developing':'exploring'; entry.updatedAt=now();
    session.showNumberLine=o.showNumberLine; session.mode=result.source; session.updatedAt=now(); await this.store.save(session);
    return {session,gap:o.gap,action:o.action,source:result.source,notice:result.notice};
  }
}
