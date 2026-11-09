import { z } from 'zod';

export const teacherOutputSchema = z.object({
  gap: z.enum(['vocabulary', 'concept', 'transfer', 'none']),
  action: z.enum(['define-term', 'concrete-example', 'number-line', 'transfer-check', 'advance']),
  explanation: z.string().min(8).max(700),
  question: z.string().min(3).max(300),
  observation: z.string().min(3).max(300),
  evidenceKind: z.enum(['observation', 'correct', 'misconception']),
  textbookExplanation: z.string().min(8).max(500),
  showNumberLine: z.boolean()
});
export type TeacherOutput = z.infer<typeof teacherOutputSchema>;

export const jsonSchema = {
  type: 'object', additionalProperties: false,
  required: ['gap','action','explanation','question','observation','evidenceKind','textbookExplanation','showNumberLine'],
  properties: {
    gap: { enum: ['vocabulary','concept','transfer','none'] }, action: { enum: ['define-term','concrete-example','number-line','transfer-check','advance'] },
    explanation: { type: 'string' }, question: { type: 'string' }, observation: { type: 'string' }, evidenceKind: { enum: ['observation','correct','misconception'] },
    textbookExplanation: { type: 'string' }, showNumberLine: { type: 'boolean' }
  }
};
