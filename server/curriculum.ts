import type { ConceptId, Language } from '../src/types.js';

export const curriculum: Record<ConceptId, { prerequisites: ConceptId[]; facts: string[]; koFacts: string[] }> = {
  zero: { prerequisites: [], facts: ['Zero represents no quantity.', 'Zero is a number and has a place on the number line.'], koFacts: ['0은 아무것도 없는 양을 나타냅니다.', '0도 수이며 수직선 위에 자리가 있습니다.'] },
  'number-line': { prerequisites: ['zero'], facts: ['Numbers increase to the right and decrease to the left.', 'Distance from zero describes magnitude.'], koFacts: ['수는 오른쪽으로 갈수록 커지고 왼쪽으로 갈수록 작아집니다.', '0에서 떨어진 거리는 수의 크기를 보여 줍니다.'] },
  'negative-numbers': { prerequisites: ['zero', 'number-line'], facts: ['Negative numbers are less than zero and lie to its left.', 'The opposite of a number is the same distance from zero on the other side.'], koFacts: ['음수는 0보다 작고 수직선에서 0의 왼쪽에 있습니다.', '어떤 수의 반대수는 0에서 같은 거리만큼 반대편에 있습니다.'] }
};

export function titleFor(concept: ConceptId, language: Language) {
  const titles = language === 'ko' ? { zero: '0의 의미', 'number-line': '수직선', 'negative-numbers': '음수' } : { zero: 'The meaning of zero', 'number-line': 'The number line', 'negative-numbers': 'Negative numbers' };
  return titles[concept];
}

export function safeArithmetic(expression: string): number | null {
  const match = expression.replace(/\s/g, '').match(/^(-?\d+)([+-])(-?\d+)$/);
  if (!match) return null;
  const a = Number(match[1]); const b = Number(match[3]);
  return match[2] === '+' ? a + b : a - b;
}
