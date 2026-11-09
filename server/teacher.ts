import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { ConceptId, Language, LearnerState, Message, SourceMode } from '../src/types.js';
import { curriculum } from './curriculum.js';
import { jsonSchema, teacherOutputSchema, type TeacherOutput } from './schema.js';
const execFileAsync = promisify(execFile);

export interface TeacherContext { language: Language; concept: ConceptId; input: string; history: Message[]; state: LearnerState; requestedMode?: SourceMode }

// Detect explicit, asserted claims about the order of integers.
// Check EVERY comparison in a sentence; a correct preamble must not hide a later false claim.
function incorrectNegativeComparison(input: string): {left:number;right:number}|null {
  const text=input.toLowerCase().replace(/[−–]/g,'-').replace(/\s+/g,' ');
  // Questions and explicit negations of a proposition are not student assertions.
  if (/[?？]/.test(text) || /\b(?:wrong|false|incorrect|not true)\b|(?:틀린|틀렸다|잘못된|아니라고)/.test(text)) return null;
  const wrong=(a:number,b:number,op:'>'|'<')=>op==='>'?!(a>b):!(a<b);
  const pairs: {left:number;right:number;op:'>'|'<'}[]=[];
  for(const match of text.matchAll(/(-?\d+)\s+(?:is\s+)?(bigger|greater|larger|more|smaller|less)\s+than\s+(-?\d+)/g)) {
    pairs.push({left:Number(match[1]),right:Number(match[3]),op:['bigger','greater','larger','more'].includes(match[2])?'>':'<'});
  }
  for(const match of text.matchAll(/(-?\d+)(?:이|가|은|는)?\s+(-?\d+)보다\s*(?:더\s*)?(크|커|작)/g)) {
    pairs.push({left:Number(match[1]),right:Number(match[2]),op:['크','커'].includes(match[3])?'>':'<'});
  }
  for(const match of text.matchAll(/(-?\d+)보다\s+(-?\d+)(?:이|가|은|는)?\s*(?:더\s*)?(크|커|작)/g)) {
    pairs.push({left:Number(match[2]),right:Number(match[1]),op:['크','커'].includes(match[3])?'>':'<'});
  }
  for(const match of text.matchAll(/(-?\d+)\s*([><])\s*(-?\d+)/g)) {
    pairs.push({left:Number(match[1]),right:Number(match[3]),op:match[2] as '>'|'<'});
  }
  for(const pair of pairs){if(wrong(pair.left,pair.right,pair.op))return {left:pair.left,right:pair.right};}
  return null;
}

export function safeTeaching(ctx: TeacherContext, output: TeacherOutput): TeacherOutput {
  const incorrect=incorrectNegativeComparison(ctx.input);
  if (incorrect) {
    const {left,right}=incorrect;
    const relation=left===right?'=':left<right?'<':'>'; 
    const ko=ctx.language==='ko';
    return {gap:'concept',action:'number-line',explanation:ko?`수직선에서는 오른쪽의 수가 더 큽니다. ${left} ${relation} ${right}입니다. 위치를 기준으로 다시 생각해 봅시다.`:`The number farther right is greater. The correct comparison is ${left} ${relation} ${right}. Let's check the positions.`,question:ko?'그러면 -4와 -2 중 어느 수가 더 큰가요? 이유도 말해 주세요.':'Which is greater, -4 or -2? Explain why.',observation:ko?'음수의 순서를 반대로 이해하는 오개념이 관찰됐습니다.':'Learner reversed the order of negative integers.',evidenceKind:'misconception',textbookExplanation:ko?`정수의 크기는 수직선 위치로 비교합니다: ${left} ${relation} ${right}.`:`Compare integers by position on the number line: ${left} ${relation} ${right}.`,showNumberLine:true};
  }
  if (/^(?:yes[,.! ]*|i understand[.! ]*|알겠어요[.! ]*|네[.! ]*)$/i.test(ctx.input.trim()) && output.evidenceKind==='correct') return {...output,gap:'transfer',action:'transfer-check',evidenceKind:'observation',observation:ctx.language==='ko'?'이해했다는 자기보고 외의 근거가 없습니다.':'Self-reported understanding is not evidence of transfer.'};
  return output;
}

function classify(input: string): TeacherOutput {
  const s = input.trim().toLowerCase();
  const ko = /[가-힣]/.test(input);
  const vocab = /(what.*mean|meaning|word|뜻|무슨 말|용어|모르겠)/.test(s);
  const transfer = /(-\d|below|left|temperature|지하|영하|왼쪽)/.test(s);
  const correct = false; // Keywords or numerals alone never establish correct understanding.
  if (vocab) return { gap:'vocabulary', action:'define-term', explanation: ko ? '먼저 말의 뜻부터 풀어 볼게요. “음수”는 0보다 작은 수이고, 앞의 − 표시는 0의 왼쪽 방향을 뜻해요.' : 'Let’s unpack the words first. A negative number is a number below zero; the minus sign points to the left of zero.', question: ko ? '수직선에서 0의 왼쪽과 오른쪽 중 어느 쪽이 더 작은 수일까요?' : 'On a number line, which side of zero holds the smaller numbers?', observation: ko ? '학습자가 핵심 용어의 뜻을 확인할 필요가 있음.' : 'Learner needs the key vocabulary clarified.', evidenceKind:'observation', textbookExplanation: ko ? '음수는 0보다 작은 수이며 수직선에서 0의 왼쪽에 있다.' : 'Negative numbers are below zero and appear to the left of zero.', showNumberLine:true };
  if (!correct) return { gap:'concept', action:'concrete-example', explanation: ko ? '온도가 0도에서 3도 내려가면 −3도예요. 0을 출발점으로 왼쪽으로 세 칸 움직이는 것과 같아요.' : 'Imagine the temperature drops three degrees from zero. It reaches −3, just like moving three steps left from zero.', question: ko ? '0에서 왼쪽으로 두 칸 가면 어떤 수일까요?' : 'What number do you reach two steps left of zero?', observation: ko ? '구체적인 방향·거리 연결이 더 필요함.' : 'Learner needs a concrete direction-and-distance connection.', evidenceKind:'misconception', textbookExplanation: ko ? '수직선에서 왼쪽 이동은 수가 작아지는 것을 뜻한다.' : 'Moving left on the number line makes a number smaller.', showNumberLine:true };
  if (transfer) return { gap:'none', action:'advance', explanation: ko ? '좋아요. 새로운 상황에도 0을 기준으로 방향과 거리를 적용했어요.' : 'Nice work—you applied direction and distance from zero in a new situation.', question: ko ? '그렇다면 −4의 반대수는 무엇이고, 왜 그럴까요?' : 'What is the opposite of −4, and why?', observation: ko ? '새로운 맥락에 개념을 적용하는 증거를 보임.' : 'Showed evidence of applying the concept in a new context.', evidenceKind:'correct', textbookExplanation: ko ? '0을 기준으로 방향과 거리를 사용해 음수를 설명할 수 있다.' : 'Can explain a negative number using direction and distance from zero.', showNumberLine:false };
  return { gap:'transfer', action:'transfer-check', explanation: ko ? '그 답은 이 예에서는 맞아요. 이제 같은 생각이 다른 상황에서도 통하는지 확인해 볼게요.' : 'That works for this example. Now let’s see whether the same idea transfers to a new situation.', question: ko ? '기온이 0도에서 5도 내려가면 몇 도일까요? 수직선으로 설명해 보세요.' : 'If the temperature falls 5 degrees from zero, what is it? Explain with the number line.', observation: ko ? '현재 예제의 이해는 보였으나 전이는 아직 확인되지 않음.' : 'Current example understood; transfer is not yet confirmed.', evidenceKind:'correct', textbookExplanation: ko ? '현재 예제는 해결했으며 다른 상황에 적용하는 연습 중이다.' : 'Solved the current example and is practicing transfer to a new context.', showNumberLine:true };
}

async function ollamaTeacher(ctx: TeacherContext): Promise<TeacherOutput> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);
  const instructions = `You are a patient adaptive math tutor. Strictly output valid JSON fields: gap (vocabulary|concept|transfer|none), action (define-term|concrete-example|number-line|transfer-check|advance), explanation, question, observation, evidenceKind (observation|correct|misconception), textbookExplanation, showNumberLine (boolean). Base facts ONLY on this reviewed mini curriculum: ${JSON.stringify(curriculum)}. Language: ${ctx.language}. Current learning objective: ${ctx.concept}. Student message: ${JSON.stringify(ctx.input)}. Previous lesson: ${JSON.stringify(ctx.history.slice(-5))}. Observed learner state: ${JSON.stringify(ctx.state)}. A student can ask a new math question; answer at an appropriate conceptual level, and check prerequisite understanding if needed. Never declare mastery based on one response or by assuming their age. If student misunderstands vocabulary, explain vocabulary; if concept, give a contrasting or visual example; if well understood, give a transfer question. Be mathematically precise. Explanation max 450 chars. Question max 160 chars. Only respond with JSON, no markdown.`;
  try {
    const resp = await fetch(process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/generate', {
      method: 'POST', headers: {'Content-Type':'application/json'}, signal:controller.signal,
      body:JSON.stringify({model:process.env.OLLAMA_MODEL||'gemma3:4b',prompt:instructions,stream:false,format:jsonSchema,options:{temperature:0.2,num_predict:520}})
    });
    if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
    const raw = await resp.json() as {response?:string};
    return teacherOutputSchema.parse(JSON.parse(raw.response||'{}'));
  } finally { clearTimeout(timeout); }
}

async function codexTeacher(ctx: TeacherContext): Promise<TeacherOutput> {
  const dir = await mkdtemp(join(tmpdir(), 'why-math-'));
  const schema = join(dir, 'schema.json'); const output = join(dir, 'output.json');
  await writeFile(schema, JSON.stringify(jsonSchema));
  const prompt = `You are the Why Math teacher engine. Return only schema-valid JSON. Teach only this reviewed curriculum: ${JSON.stringify(curriculum)}. Current concept: ${ctx.concept}. Language: ${ctx.language}. Learner message: ${JSON.stringify(ctx.input)}. Prior messages: ${JSON.stringify(ctx.history.slice(-6))}. Learner state (observations, not age): ${JSON.stringify(ctx.state)}. Never mention or infer a simulated persona. Never claim mastery from one response. Choose a useful adaptive action. Mathematical claims must stay inside the curriculum. Include one explanation and one question in the requested language. A number line is appropriate for direction, zero, or negatives.`;
  await execFileAsync('codex', ['exec','--ephemeral','--sandbox','read-only','--skip-git-repo-check','--output-schema',schema,'--output-last-message',output,prompt], { timeout: 60_000, maxBuffer: 1024 * 1024 });
  return teacherOutputSchema.parse(JSON.parse(await readFile(output, 'utf8')));
}

export async function teach(ctx: TeacherContext): Promise<{ output: TeacherOutput; source: SourceMode; notice?: string }> {
  if (ctx.requestedMode === 'replay-fixture') return { output: safeTeaching(ctx, classify(ctx.input)), source:'replay-fixture', notice:'Deterministic test fixture replay—no live model call.' };
  if (process.env.WHY_MATH_OFFLINE === '1' || ctx.requestedMode === 'offline-fallback') return { output: safeTeaching(ctx, classify(ctx.input)), source:'offline-fallback', notice:'Deterministic offline teacher—Codex was not called.' };
  if (ctx.requestedMode === 'ollama-local' || !ctx.requestedMode) { try { return {output:safeTeaching(ctx,await ollamaTeacher(ctx)),source:'ollama-local'}; } catch (e) {return {output:safeTeaching(ctx,classify(ctx.input)),source:'offline-fallback',notice:`Local model unavailable; deterministic demonstration used: ${e instanceof Error?e.message:'unknown'}`};} }
  try { return { output: safeTeaching(ctx,await codexTeacher(ctx)), source:'codex-live' }; }
  catch (error) { const reason = error instanceof Error ? error.message.split('\n')[0] : 'model unavailable'; return { output: safeTeaching(ctx, classify(ctx.input)), source:'offline-fallback', notice:`Codex unavailable; deterministic teacher used. ${reason}` }; }
}
