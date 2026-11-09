import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import net from 'node:net';

let server: ChildProcess;
let base: string;
let directory: string;

async function availablePort(): Promise<number> {
  return await new Promise((resolve,reject)=>{
    const socket=net.createServer();socket.once('error',reject);socket.listen(0,'127.0.0.1',()=>{const addr=socket.address(); if(!addr||typeof addr==='string'){socket.close();return reject(new Error('invalid address'));}socket.close(()=>resolve(addr.port));});
  });
}
async function http(path:string,body?:unknown,credential?:string){
  const headers:Record<string,string>={'Content-Type':'application/json'};
  if(credential)headers.Authorization=`Bearer ${credential}`;
  const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text();let parsed:Record<string,unknown>={};try{parsed=JSON.parse(text);}catch{}return {code:r.status,body:parsed};
}

beforeAll(async()=>{
  directory=await mkdtemp(join(tmpdir(),'why-math-integration-'));
  const port=await availablePort();base=`http://127.0.0.1:${port}`;
  server=spawn(process.execPath,['--import','tsx','server/index.ts'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),WHY_MATH_SESSION_FILE:join(directory,'sessions.json'),WHY_MATH_OFFLINE:'1'},stdio:'ignore'});
  let ready=false;
  for(let i=0;i<80;i++){
    if(server.exitCode!==null)throw new Error(`API server exited: ${server.exitCode}`);
    try{const r=await fetch(base+'/api/health');if(r.ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,75));
  }
  if(!ready)throw new Error('API server did not become ready');
},15000);
afterAll(async()=>{if(server){server.kill('SIGTERM');}if(directory)await rm(directory,{recursive:true,force:true});});

describe('HTTP integration: capability access boundary',()=>{
  it('disables the public session listing',async()=>{expect((await http('/api/sessions')).code).toBe(404);});
  it('gates reading, writing, and simulation with per-session bearer capability',async()=>{
    const created=await http('/api/sessions',{learnerId:'human-1',learnerLabel:'Student',language:'en',mode:'offline-fallback',concept:'zero'});
    expect(created.code).toBe(201);
    const session=created.body.session as {id:string;messages:unknown[]};const token=created.body.accessToken as string;
    expect(token.length).toBeGreaterThan(40);
    expect(JSON.stringify(created.body)).not.toContain('accessHash');
    expect((await http('/api/sessions/'+session.id)).code).toBe(403);
    expect((await http('/api/sessions/'+session.id,undefined,'wrong')).code).toBe(403);
    expect((await http('/api/sessions/'+session.id,undefined,token)).code).toBe(200);
    expect((await http('/api/sessions/'+session.id+'/turns',{input:'Why zero?',mode:'offline-fallback'})).code).toBe(403);
    const ok=await http('/api/sessions/'+session.id+'/turns',{input:'What does zero mean?',mode:'offline-fallback'},token);
    expect(ok.code).toBe(200);
    expect(JSON.stringify(ok.body)).not.toContain('accessHash');
    expect((await http('/api/sessions/'+session.id+'/simulate',{},token)).code).toBe(403);
    expect((await http('/api/sessions/'+session.id+'/turns',{input:'try replay',mode:'replay-fixture'},token)).code).toBe(403);
  });
  it('requires explicit Test Mode for a simulated learner',async()=>{
    const forbidden=await http('/api/sessions',{learnerId:'human-2',learnerLabel:'Student',language:'en',mode:'replay-fixture'});
    expect(forbidden.code).toBe(400);
    const fixture=await http('/api/sessions',{learnerId:'learner-a',learnerLabel:'Fixture A',language:'en',mode:'replay-fixture',fixture:true});
    expect(fixture.code).toBe(201);
    const session=fixture.body.session as {id:string;isFixture:boolean};expect(session.isFixture).toBe(true);
  });
});
