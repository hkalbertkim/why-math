/** Private, server-only OpenAI teaching adapter. Never expose the API key to the browser or GitHub. */
import OpenAI from 'openai';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { TeacherContext } from './teacher.js';
import type { TeacherOutput } from './schema.js';
import { jsonSchema, teacherOutputSchema } from './schema.js';
import { curriculum } from './curriculum.js';

let clientPromise: Promise<OpenAI> | undefined;
async function client(): Promise<OpenAI> {
  clientPromise ??= (async()=>{
    const file=process.env.WHY_MATH_OPENAI_KEY_FILE || join(homedir(),'.config','why-math','openai-api-key');
    const key=(await readFile(file,'utf8')).trim();
    if(!/^sk-[\w-]{30,}$/.test(key))throw new Error('OpenAI API key is unavailable or invalid');
    return new OpenAI({apiKey:key,timeout:45_000,maxRetries:0});
  })();
  return clientPromise;
}

export async function openaiTeacher(ctx: TeacherContext): Promise<TeacherOutput> {
  const c=await client();
  const lang=ctx.language==='ko'?'Korean (한국어)':'English';
  const selected=curriculum[ctx.concept];
  const history=ctx.history.slice(-7).map(m=>({role:m.role,text:m.text}));
  const guidance=`You are Why Math, a skilled and accurate human-friendly AI mathematics tutor. You TEACH, not simply answer as a chat assistant.
OUTPUT: Return only a valid JSON object matching the required response format. All human-readable strings MUST be in ${lang}, with natural clear wording.
HIGH PRIORITY: The latest learner message is the question you MUST address. First explain that exact question in plain language. Never replace the learner's question with a different math topic. Do not bring up like terms, rearranging algebraic equations, negative numbers, or other concepts unless relevant to the actual latest question.
THIS SESSION: Start concept ${ctx.concept}. Curriculum facts (reviewed): ${JSON.stringify(selected)}.
- The curriculum facts are grounding context, NOT permission to ignore a different question. If the learner explicitly asks about another math idea, answer their actual idea accurately and gently bridge back if appropriate. If the question is unclear, ASK what they mean; do not invent a misunderstanding.
- For zero: zero is a number representing no items; 0 has a fixed position on a number line; a+0=a. An empty basket holds 0 apples. Never confuse zero with algebraic like terms, operations such as moving terms across equations, or negative-number order.
- When learner asks what something means, define that exact term BEFORE other examples.
- If learner asks WHY or why an operation is needed, explain the actual reason and show one short example before asking a question. For equation transposition (이항), clarify that moving an algebraic term is shorthand for applying the same inverse operation to both sides, which preserves equality; a sign change is a consequence, not a magical move. Example: x + 3 = 5, subtract 3 from BOTH sides to get x = 2.
- Do not assert a learner has mastered a topic from one reply. A question is an observation, not evidence of an error. If uncertain, record observation, not misconception.
- Provide one concise explanation (around 2–5 sentences), followed by ONE clear and relevant question. Avoid formula memorization; make the underlying reason visible.
- observation describes what the learner ACTUALLY said, not a psychological diagnosis. A question alone is never evidence of a misconception.
- textbookExplanation accurately summarizes the core explanation just given, not an unrelated topic.
- showNumberLine true for number line and negatives, and zero when the number/quantity is discussed.
- Keep the teaching action (define-term, concrete-example, number-line, transfer-check, advance) consistent with the actual question.
Prior conversation (oldest first): ${JSON.stringify(history)}.
Learner understanding signals (not mastery): ${JSON.stringify(ctx.state)}.
IMPORTANT: Answer the LATEST student message below, not the earlier conversation.`;
  const response=await c.chat.completions.create({
    model:process.env.WHY_MATH_OPENAI_MODEL||'gpt-4.1-mini',
    messages:[{role:'system',content:guidance},{role:'user',content:`Latest student message: ${ctx.input}`}],
    response_format:{type:'json_schema',json_schema:{name:'why_math_teacher',strict:true,schema:jsonSchema}},
    max_completion_tokens:900,
    store:false
  });
  const choice=response.choices[0];
  if(!choice?.message?.content || choice.finish_reason!=='stop')throw new Error('OpenAI tutor returned no complete answer');
  return teacherOutputSchema.parse(JSON.parse(choice.message.content));
}
