import { beforeAll,afterAll,describe,it,expect } from 'vitest';
import { spawn,type ChildProcess } from 'node:child_process';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import net from 'node:net';
let server:ChildProcess;let base='';let directory='';
async function port():Promise<number>{return new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{const address=s.address();if(!address||typeof address==='string')return reject(new Error('No port'));s.close(()=>resolve(address.port))})})}
async function request(path:string,body?:unknown,token?:string){
 const headers:Record<string,string>={'Content-Type':'application/json','CF-Connecting-IP':'203.0.113.77'};
 if(token)headers.Authorization=`Bearer ${token}`;
 const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:JSON.stringify(body)});
 const raw=await r.text();return {status:r.status,body:raw?JSON.parse(raw):{}};
}
beforeAll(async()=>{
 directory=await mkdtemp(join(tmpdir(),'why-math-public-'));
 const p=await port();base=`http://127.0.0.1:${p}`;
 server=spawn(process.execPath,['--import','tsx','server/index.ts'],{cwd:process.cwd(),env:{...process.env,PORT:String(p),WHY_MATH_SESSION_FILE:join(directory,'sessions.json'),WHY_MATH_PUBLIC_BETA:'1',WHY_MATH_OFFLINE:'1'},stdio:'ignore'});
 for(let i=0;i<70;i++){
  if(server.exitCode!==null)throw new Error(`Server exit ${server.exitCode}`);
  try{if((await fetch(base+'/api/health')).ok)return}catch{}
  await new Promise(resolve=>setTimeout(resolve,80));
 }
 throw new Error('Beta server did not start');
},15000);
afterAll(async()=>{server?.kill('SIGTERM');if(directory)await rm(directory,{recursive:true,force:true})});
describe('public beta safety boundaries',()=>{
 it('rejects public Codex execution mode',async()=>{
  const res=await request('/api/sessions',{learnerId:'x',learnerLabel:'Test',language:'en',mode:'codex-live'});
  expect(res.status).toBe(400);
 });
 it('limits new sessions and continues to enforce capability access',async()=>{
  const args={learnerId:'public',learnerLabel:'Public',language:'en',concept:'zero',mode:'openai-live'};
  const first=await request('/api/sessions',args);expect(first.status).toBe(201);
  expect((await request('/api/sessions/'+first.body.session.id)).status).toBe(403);
  expect((await request('/api/sessions/'+first.body.session.id,undefined,first.body.accessToken)).status).toBe(200);
  for(let i=0;i<7;i++)expect((await request('/api/sessions',{...args,learnerId:'public-'+i})).status).toBe(201);
  expect((await request('/api/sessions',{...args,learnerId:'public-extra'})).status).toBe(429);
 });
});
