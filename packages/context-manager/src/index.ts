export interface Context {
  [key: string]: unknown;
}

export interface Document {
  id: string;
  content: string;
}

export interface DocumentShard {
  id: string;
  documentId: string;
  content: string;
}

export interface ContextSession {
  id: string;
  userId: string;
  state: Record<string, unknown>;
}

export interface SessionState {
  [key: string]: unknown;
}

export class ContextManager {
  private sessions = new Map<string, ContextSession>();

  createSession(userId: string): ContextSession {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const session: ContextSession = { id, userId, state: {} };
    this.sessions.set(id, session);
    return session;
  }

  getSession(sessionId: string): ContextSession {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error(`Session not found: ${sessionId}`);
    return s;
    
  }

  async shareContext(_fromAgent: string, _toAgent: string, _context: Context): Promise<void> {
    // Placeholder for secure context sharing
  }

  mergeContexts(contexts: Context[]): Context {
    return Object.assign({}, ...contexts);
  }

  shardDocument(document: Document): DocumentShard[] {
    // naive fixed-size shards
    const size = 1000;
    const chunks: DocumentShard[] = [];
    for (let i = 0; i < document.content.length; i += size) {
      chunks.push({
        id: `${document.id}:${i / size}`,
        documentId: document.id,
        content: document.content.slice(i, i + size),
      });
    }
    return chunks.length ? chunks : [{ id: `${document.id}:0`, documentId: document.id, content: document.content }];
  }

  retrieveRelevantShards(query: string, shards: DocumentShard[]): DocumentShard[] {
    const q = query.toLowerCase();
    return shards.filter(s => s.content.toLowerCase().includes(q));
  }

  async saveState(sessionId: string, state: SessionState): Promise<void> {
    const s = this.getSession(sessionId);
    s.state = { ...s.state, ...state };
    this.sessions.set(sessionId, s);
  }

  async restoreState(sessionId: string): Promise<SessionState> {
    return this.getSession(sessionId).state;
  }
}

