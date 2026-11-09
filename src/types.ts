export type Language = 'en' | 'ko';
export type ConceptId = 'zero' | 'number-line' | 'negative-numbers' | 'equations';
export type SourceMode = 'openai-live' | 'codex-live' | 'ollama-local' | 'offline-fallback' | 'replay-fixture';
export type Gap = 'vocabulary' | 'concept' | 'transfer' | 'none';

export interface Message { id: string; role: 'teacher' | 'learner'; text: string; action?: string; createdAt: string }
export interface Evidence { id: string; concept: ConceptId; kind: 'observation' | 'correct' | 'misconception'; text: string; createdAt: string }
export interface TextbookEntry { id: string; concept: ConceptId; title: string; fact: string; explanation: string; status: 'exploring' | 'developing' | 'evidenced'; evidence: string; updatedAt: string }
export interface LearnerState { vocabulary: number; concept: number; transfer: number; observations: string[] }
export interface Session {
  id: string; learnerId: string; learnerLabel: string; isFixture?: boolean; language: Language; concept: ConceptId; mode: SourceMode;
  messages: Message[]; evidence: Evidence[]; textbook: TextbookEntry[]; state: LearnerState; showNumberLine: boolean; updatedAt: string;
}
export interface TurnResult { session: Session; gap: Gap; action: string; source: SourceMode; notice?: string }
