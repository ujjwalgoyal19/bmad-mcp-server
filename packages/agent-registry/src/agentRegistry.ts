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

export class AgentRegistry {
  private agents = new Map<string, AgentStatus>();
  private intervalHandle?: NodeJS.Timeout;

  constructor(
    private healthChecker?: HealthChecker,
    private pollIntervalMs: number = 15_000
  ) {}

  register(agent: AgentDescriptor): void {
    this.agents.set(agent.id, {
      ...agent,
      lastSeen: null,
      health: "unknown",
    });
  }

  unregister(agentId: string): void {
    this.agents.delete(agentId);
  }

  list(): AgentStatus[] {
    return [...this.agents.values()];
  }

  get(agentId: string): AgentStatus | undefined {
    return this.agents.get(agentId);
  }

  async checkOnce(): Promise<void> {
    if (!this.healthChecker) return;
    const now = Date.now();
    for (const [id, agent] of this.agents) {
      try {
        const ok = await this.healthChecker.check(agent);
        agent.health = ok ? "healthy" : "unhealthy";
        agent.lastSeen = ok ? now : agent.lastSeen;
      } catch {
        agent.health = "unhealthy";
      }
      this.agents.set(id, agent);
    }
  }

  startMonitoring(): void {
    if (this.intervalHandle) return;
    this.intervalHandle = setInterval(() => {
      void this.checkOnce();
    }, this.pollIntervalMs);
  }

  stopMonitoring(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }
  }
}

