import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, rm, open } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Session } from '../src/types.js';

export interface SessionRecord extends Session { accessHash?: string }
export function publicSession(s: SessionRecord): Session {
  const {accessHash: _secret, ...safe} = s;
  return structuredClone(safe);
}
export class SessionStore {
  private sessions = new Map<string, SessionRecord>();
  private pending: Promise<unknown> = Promise.resolve();
  constructor(private file = join(process.cwd(), 'data', 'sessions.json')) {}
  async load() {
    let values: SessionRecord[];
    try { values = JSON.parse(await readFile(this.file, 'utf8')); }
    catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return; throw new Error(`Session database unavailable or corrupted: ${String(e)}`); }
    if (!Array.isArray(values) || values.some(v => typeof v?.id !== 'string' || !Array.isArray(v.messages) || (v.accessHash !== undefined && !/^[0-9a-f]{64}$/.test(v.accessHash)))) throw new Error('Session database invalid');
    // Legacy records without accessHash remain on disk but are inaccessible via API.
    // Never silently give legacy records a new public capability.
    this.sessions = new Map(values.map(s => [s.id, structuredClone(s)]));
  }
  count(): number {return this.sessions.size;}
  // Delete sessions older than the beta retention window using the same serialized, atomic file path.
  async pruneOlderThan(cutoffISO:string):Promise<number> {
    const task=async()=>{
      const next=new Map([...this.sessions].filter(([_id,s])=>s.updatedAt>=cutoffISO));
      const removed=this.sessions.size-next.size;
      if(!removed)return 0;
      await mkdir(dirname(this.file),{recursive:true});
      const temp=`${this.file}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`;
      try {
        const file=await open(temp,'wx',0o600);
        try {await file.writeFile(JSON.stringify([...next.values()],null,2));await file.sync();}
        finally{await file.close()}
        await rename(temp,this.file);
        this.sessions=next;
        const directory=await open(dirname(this.file),'r');
        try{await directory.sync()}finally{await directory.close()}
      }finally{await rm(temp,{force:true}).catch(()=>{})}
      return removed;
    };
    const work=this.pending.then(task,task);this.pending=work.catch(()=>{});return await work;
  }
  get(id: string): SessionRecord | undefined { const s = this.sessions.get(id); return s ? structuredClone(s) : undefined; }
  // Token is returned once at creation. Persist only its digest, never return it via GET.
  async issueCapability(id: string): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    const session = this.get(id); if (!session) throw new Error('Session not found');
    session.accessHash = createHash('sha256').update(token).digest('hex');
    await this.save(session); return token;
  }
  authorize(id: string, token?: string): boolean {
    const expected=this.sessions.get(id)?.accessHash;
    if (!expected || !/^[0-9a-f]{64}$/.test(expected) || !token || token.length>150) return false;
    const actual=createHash('sha256').update(token).digest('hex');
    const a=Buffer.from(expected,'hex'),b=Buffer.from(actual,'hex');
    return a.length===32 && b.length===32 && timingSafeEqual(a,b);
  }
  async save(session: SessionRecord): Promise<SessionRecord> {
    const task = async () => {
      const next = new Map(this.sessions);
      next.set(session.id, structuredClone(session));
      await mkdir(dirname(this.file), {recursive:true});
      const path = `${this.file}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`;
      try {
        const file=await open(path,'wx',0o600);
        try { await file.writeFile(JSON.stringify([...next.values()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),null,2)); await file.sync(); }
        finally { await file.close(); }
        await rename(path,this.file);
        // Rename installed the new snapshot: in-memory state must match even if directory fsync fails.
        this.sessions = next;
        // Flush the renamed directory entry before acknowledging persistence.
        const directory=await open(dirname(this.file),'r');
        try { await directory.sync(); } finally { await directory.close(); }
      } finally { await rm(path,{force:true}).catch(()=>{}); }
    };
    const job=this.pending.then(task,task);
    this.pending=job.catch(()=>{});
    await job;
    return structuredClone(session);
  }
}
