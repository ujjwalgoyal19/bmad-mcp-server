"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
class AgentRegistry {
    constructor(healthChecker, pollIntervalMs = 15000) {
        this.healthChecker = healthChecker;
        this.pollIntervalMs = pollIntervalMs;
        this.agents = new Map();
    }
    register(agent) {
        this.agents.set(agent.id, {
            ...agent,
            lastSeen: null,
            health: "unknown",
        });
    }
    unregister(agentId) {
        this.agents.delete(agentId);
    }
    list() {
        return [...this.agents.values()];
    }
    get(agentId) {
        return this.agents.get(agentId);
    }
    async checkOnce() {
        if (!this.healthChecker)
            return;
        const now = Date.now();
        for (const [id, agent] of this.agents) {
            try {
                const ok = await this.healthChecker.check(agent);
                agent.health = ok ? "healthy" : "unhealthy";
                agent.lastSeen = ok ? now : agent.lastSeen;
            }
            catch {
                agent.health = "unhealthy";
            }
            this.agents.set(id, agent);
        }
    }
    startMonitoring() {
        if (this.intervalHandle)
            return;
        this.intervalHandle = setInterval(() => {
            void this.checkOnce();
        }, this.pollIntervalMs);
    }
    stopMonitoring() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = undefined;
        }
    }
}
exports.AgentRegistry = AgentRegistry;
//# sourceMappingURL=agentRegistry.js.map