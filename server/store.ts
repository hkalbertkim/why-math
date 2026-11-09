import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Session } from '../src/types.js';

export class SessionStore {
  private sessions = new Map<string, Session>();
  constructor(private file = join(process.cwd(), 'data', 'sessions.json')) {}
  async load() { try { const values: Session[] = JSON.parse(await readFile(this.file, 'utf8')); this.sessions = new Map(values.map(s => [s.id, s])); } catch {} }
  list() { return [...this.sessions.values()].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)); }
  get(id: string) { return this.sessions.get(id); }
  async save(session: Session) { this.sessions.set(session.id, structuredClone(session)); await mkdir(dirname(this.file), { recursive:true }); await writeFile(this.file, JSON.stringify(this.list(), null, 2)); return session; }
}
