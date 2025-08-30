"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
class ContextManager {
    constructor() {
        this.sessions = new Map();
    }
    createSession(userId) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const session = { id, userId, state: {} };
        this.sessions.set(id, session);
        return session;
    }
    getSession(sessionId) {
        const s = this.sessions.get(sessionId);
        if (!s)
            throw new Error(`Session not found: ${sessionId}`);
        return s;
    }
    async shareContext(_fromAgent, _toAgent, _context) {
        // Placeholder for secure context sharing
    }
    mergeContexts(contexts) {
        return Object.assign({}, ...contexts);
    }
    shardDocument(document) {
        // naive fixed-size shards
        const size = 1000;
        const chunks = [];
        for (let i = 0; i < document.content.length; i += size) {
            chunks.push({
                id: `${document.id}:${i / size}`,
                documentId: document.id,
                content: document.content.slice(i, i + size),
            });
        }
        return chunks.length ? chunks : [{ id: `${document.id}:0`, documentId: document.id, content: document.content }];
    }
    retrieveRelevantShards(query, shards) {
        const q = query.toLowerCase();
        return shards.filter(s => s.content.toLowerCase().includes(q));
    }
    async saveState(sessionId, state) {
        const s = this.getSession(sessionId);
        s.state = { ...s.state, ...state };
        this.sessions.set(sessionId, s);
    }
    async restoreState(sessionId) {
        return this.getSession(sessionId).state;
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=index.js.map