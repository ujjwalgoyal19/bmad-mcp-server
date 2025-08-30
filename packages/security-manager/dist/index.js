"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityManager = void 0;
class SecurityManager {
    constructor() {
        this.tokens = new Map();
        this.users = new Map();
        this.policy = {};
    }
    addUser(user) {
        this.users.set(user.id, user);
    }
    setPolicy(policy) {
        this.policy = policy;
    }
    async authenticate(credentials) {
        // demo: accept any known user-id, ignore password
        const id = credentials.user;
        if (!this.users.has(id))
            throw new Error("Unknown user");
        const token = {
            token: `${id}.${Math.random().toString(36).slice(2)}`,
            user: id,
            issuedAt: Date.now(),
        };
        this.tokens.set(token.token, token);
        return token;
    }
    async validateToken(token) {
        const t = typeof token === "string" ? this.tokens.get(token) : this.tokens.get(token.token);
        return !!t;
    }
    async authorize(user, resource, action) {
        for (const role of user.roles) {
            const rules = this.policy[role]?.allow || [];
            for (const rule of rules) {
                if (rule.resource === resource && rule.actions.includes(action))
                    return true;
            }
        }
        return false;
    }
    enforcePolicy(policy) {
        this.setPolicy(policy);
    }
    logAccess(_user, _resource, _action) {
        // integrate with real audit logger later
    }
    async generateAuditReport(_criteria) {
        return { entries: 0 };
    }
}
exports.SecurityManager = SecurityManager;
//# sourceMappingURL=index.js.map