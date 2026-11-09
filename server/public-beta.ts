/** Narrow, no-login beta protection. This is not a replacement for managed production auth. */
import type { RequestHandler } from 'express';
import { isIP } from 'node:net';

interface DailyUsage { day:number; sessions:number; turns:number; active:number }
const ips=new Map<string,DailyUsage>();
let globalActive=0;
let globalDay=-1;
let globalTurns=0;
const dayIndex=()=>Math.floor(Date.now()/86_400_000);
export const publicBetaEnabled=process.env.WHY_MATH_PUBLIC_BETA==='1';

export const publicBetaGuard:RequestHandler=(req,res,next)=>{
  if(!publicBetaEnabled || req.method==='GET')return next();
  if(req.body?.mode==='codex-live')return res.status(400).json({error:'Codex is unavailable in the public beta. Select Live local AI.'});
  if(!['POST','PATCH'].includes(req.method))return res.status(405).json({error:'Method not permitted'});

  // The API only binds to loopback and is reached externally via our own Cloudflare Tunnel.
  const cfIP=req.header('cf-connecting-ip')||'';
  const ip=isIP(cfIP)?cfIP:req.ip||'local';
  const day=dayIndex();
  if(day!==globalDay){globalDay=day;globalTurns=0;for(const [k,v] of ips){if(v.day<day)ips.delete(k)}}
  let usage=ips.get(ip);
  if(!usage || usage.day!==day){usage={day,sessions:0,turns:0,active:0};ips.set(ip,usage)}

  const create=req.method==='POST' && req.path==='/sessions';
  const turn=req.method==='POST' && /\/sessions\/[^/]+\/(?:turns|simulate)$/.test(req.path);
  const firstQuestion=create&&!!req.body?.entryInput?.trim();
  const modelCall=turn||firstQuestion;
  if(create&&usage.sessions>=8)return res.status(429).json({error:'Daily session limit reached. Try again tomorrow.'});
  if(modelCall&&usage.turns>=40)return res.status(429).json({error:'Daily AI message limit reached. Try again tomorrow.'});
  if(modelCall&&globalTurns>=450)return res.status(429).json({error:'Public beta daily capacity reached. Please try tomorrow.'});
  if(modelCall&&(globalActive>=2||usage.active>=1)){
    res.setHeader('Retry-After','20');
    return res.status(503).json({error:'The AI tutor is busy. Please try again in about 20 seconds.'});
  }
  if(create)usage.sessions++;
  if(modelCall){usage.turns++;globalTurns++;usage.active++;globalActive++;let released=false;const release=()=>{if(!released){released=true;usage!.active=Math.max(0,usage!.active-1);globalActive=Math.max(0,globalActive-1)}};res.once('finish',release);res.once('close',release)}
  next();
};

export function betaStatus(){return {enabled:publicBetaEnabled,active:globalActive,remainingToday:Math.max(0,450-globalTurns)};}
