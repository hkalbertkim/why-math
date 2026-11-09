import express from 'express';
import { z } from 'zod';
import { LessonService } from './service.js';
import { SessionStore, publicSession } from './store.js';
import { simulateStudent } from './student.js';
const app=express(); app.use(express.json({limit:'32kb'}));
const store=new SessionStore(process.env.WHY_MATH_SESSION_FILE); await store.load(); const service=new LessonService(store);
app.get('/api/health', (_req,res)=>res.json({ok:true,service:'why-math',codexCli:true,time:new Date().toISOString()}));
function access(req:express.Request,res:express.Response,next:express.NextFunction){
  const token=req.header('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]{30,150})$/)?.[1];
  if(!store.authorize(String(req.params.id),token))return res.status(403).json({error:'Session access denied'});
  next();
}
app.get('/api/sessions/:id',access,(req,res)=>{const s=store.get(String(req.params.id));return s?res.json(publicSession(s)):res.status(404).json({error:'Session not found'});});
app.post('/api/sessions',async(req,res,next)=>{try{const b=z.object({learnerId:z.string().min(1).max(60),learnerLabel:z.string().min(1).max(60),language:z.enum(['en','ko']),mode:z.enum(['codex-live','ollama-local','offline-fallback','replay-fixture']).optional(),concept:z.enum(['zero','number-line','negative-numbers']).optional(),entryInput:z.string().max(400).optional(),fixture:z.boolean().optional()}).parse(req.body);if(b.fixture && !['learner-a','learner-b','learner-c'].includes(b.learnerId))return res.status(400).json({error:'Unknown test fixture'});if(!b.fixture && b.mode==='replay-fixture')return res.status(400).json({error:'Replay mode is only available in Test Mode'});const session=await service.create(b.learnerId,b.learnerLabel,b.language,b.concept||'zero',b.mode,b.fixture===true);const accessToken=await store.issueCapability(session.id);const result=b.entryInput?.trim()?(await service.turn(session.id,b.entryInput,b.mode)).session:session;res.status(201).json({session:publicSession(store.get(session.id)??result),accessToken});}catch(e){next(e)}});
app.patch('/api/sessions/:id/language',access,async(req,res,next)=>{try{const {language}=z.object({language:z.enum(['en','ko'])}).parse(req.body);const session=await service.setLanguage(String(req.params.id),language);res.json(publicSession(session));}catch(e){next(e)}});
app.post('/api/sessions/:id/simulate',access,async(req,res,next)=>{try{const s=store.get(String(req.params.id));if(!s)return res.status(404).json({error:'Session not found'});if(!s.isFixture)return res.status(403).json({error:'Simulation only available in Test Mode'});const student=await simulateStudent(s);const b=z.object({mode:z.enum(['codex-live','ollama-local','offline-fallback','replay-fixture']).optional()}).parse(req.body||{});const result=await service.turn(s.id,student.response,b.mode||'ollama-local');res.json({...result,session:publicSession(result.session),student});}catch(e){next(e)}});
app.post('/api/sessions/:id/turns',access,async(req,res,next)=>{try{const b=z.object({input:z.string().min(1).max(1000),mode:z.enum(['codex-live','ollama-local','offline-fallback','replay-fixture']).optional()}).parse(req.body);const session=store.get(String(req.params.id));if(b.mode==='replay-fixture' && !session?.isFixture)return res.status(403).json({error:'Replay only available in Test Mode'});const result=await service.turn(String(req.params.id),b.input,b.mode);res.json({...result,session:publicSession(result.session)});}catch(e){next(e)}});
app.use((err:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{const message=err instanceof Error?err.message:'Request failed';res.status(message==='Session not found'?404:400).json({error:message});});
const port=Number(process.env.PORT||8787); const host=process.env.WHY_MATH_BIND_HOST||'127.0.0.1'; app.listen(port,host,()=>console.log(`Why Math API on http://${host}:${port}`));
