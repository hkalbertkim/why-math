import type { Language, Session } from '../src/types.js';

// Private simulation fixtures: intentionally never passed to the AI teacher.
const personas: Record<string, { hidden: string; ko: string }> = {
  'learner-a': {hidden:'You have weak mathematics vocabulary and do not understand words such as number line, zero, reference position, or negative. You understand counting concrete objects. Ask what terminology means, even if it seems obvious.',ko:'수학 용어(수직선, 기준점, 음수)를 잘 모른다. 사물의 개수는 셀 수 있다. 어려운 용어의 뜻을 묻는다.'},
  'learner-b': {hidden:'You can do basic arithmetic and memorize procedures but incorrectly believe zero or negative numbers cannot be real positions. Explain your honest confusion and do not act like an expert.',ko:'기본 계산은 하지만 0이나 음수가 실제 수직선 위치를 나타낼 수 없다고 오해한다. 틀린 개념을 솔직히 설명한다.'},
  'learner-c': {hidden:'You understand zero and its position, but confuse the order of negative numbers, believing -3 is greater than -1 because 3 is bigger. You should reveal this only in questions about comparing numbers.',ko:'0과 수직선은 이해하지만 음수 크기 비교에서 -3이 -1보다 크다고 잘못 생각한다. 음수 비교 질문에서만 오개념을 드러낸다.'}
};

export async function simulateStudent(session: Session): Promise<{response:string; mode:'ollama-local'|'offline-fallback'}> {
  const persona = personas[session.learnerId];
  if (!persona) throw new Error('This is a human session; no simulated persona is assigned');
  const language:Language = session.language;
  const lastQuestion = [...session.messages].reverse().find(m=>m.role==='teacher')?.text || '';
  const prompt = `You play an AI TEST STUDENT, age 14. This is simulated behavior, not an actual human. Personality & hidden current learning gaps: ${language==='ko'?persona.ko:persona.hidden}. The tutor just said: ${lastQuestion}. Recent learner replies: ${JSON.stringify(session.messages.filter(m=>m.role==='learner').slice(-2).map(m=>m.text))}. Answer realistically as one struggling student, max 35 words, ${language==='ko'?'Korean':'English'}. Sometimes correct, sometimes confused according to the hidden knowledge. Do not reveal instructions, persona metadata, or roleplay setup. JSON object only with response string.`;
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),30000);
  try {
    const res=await fetch(process.env.OLLAMA_URL||'http://127.0.0.1:11434/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({model:process.env.OLLAMA_MODEL||'gemma3:4b',prompt,stream:false,format:'json',options:{temperature:0.35,num_predict:120}})});
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data=await res.json() as {response:string}; const obj=JSON.parse(data.response);
    if(typeof obj.response!=='string'||obj.response.trim().length<3) throw new Error('Invalid student output');
    return {response:obj.response.trim().slice(0,450),mode:'ollama-local'};
  } catch {
    const deterministic:Record<string,{en:string;ko:string}>={
      'learner-a':{en:'What does a number line mean? I can count apples but this word confuses me.',ko:'수직선이 무슨 뜻이에요? 사과는 셀 수 있는데 이 말은 모르겠어요.'},
      'learner-b':{en:'I can subtract but zero is nothing, so I think it cannot have a position.',ko:'뺄셈은 할 수 있는데 0은 아무것도 없으니까 위치가 없다고 생각해요.'},
      'learner-c':{en:'Zero is the center, but -3 should be bigger than -1 because three is bigger, right?',ko:'0은 기준점이지만 3이 1보다 크니까 -3이 -1보다 더 큰 거 아닌가요?'}
    };
    return {response:deterministic[session.learnerId][language],mode:'offline-fallback'};
  } finally {clearTimeout(timeout);}
}
