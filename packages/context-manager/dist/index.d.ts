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
export declare class ContextManager {
    private sessions;
    createSession(userId: string): ContextSession;
    getSession(sessionId: string): ContextSession;
    shareContext(_fromAgent: string, _toAgent: string, _context: Context): Promise<void>;
    mergeContexts(contexts: Context[]): Context;
    shardDocument(document: Document): DocumentShard[];
    retrieveRelevantShards(query: string, shards: DocumentShard[]): DocumentShard[];
    saveState(sessionId: string, state: SessionState): Promise<void>;
    restoreState(sessionId: string): Promise<SessionState>;
}
//# sourceMappingURL=index.d.ts.map