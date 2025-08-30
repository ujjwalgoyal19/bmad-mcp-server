export type AgentHealth = "unknown" | "healthy" | "unhealthy";
export interface AgentDescriptor {
    id: string;
    name: string;
    description?: string;
    capabilities?: Record<string, unknown>;
}
export interface AgentStatus extends AgentDescriptor {
    lastSeen: number | null;
    health: AgentHealth;
}
export interface HealthChecker {
    check(agent: AgentDescriptor): Promise<boolean>;
}
export declare class AgentRegistry {
    private healthChecker?;
    private pollIntervalMs;
    private agents;
    private intervalHandle?;
    constructor(healthChecker?: HealthChecker | undefined, pollIntervalMs?: number);
    register(agent: AgentDescriptor): void;
    unregister(agentId: string): void;
    list(): AgentStatus[];
    get(agentId: string): AgentStatus | undefined;
    checkOnce(): Promise<void>;
    startMonitoring(): void;
    stopMonitoring(): void;
}
//# sourceMappingURL=agentRegistry.d.ts.map