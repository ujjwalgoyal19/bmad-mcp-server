export interface Credentials {
  user: string;
  password?: string;
  token?: string;
}

export interface AuthToken {
  token: string;
  user: string;
  issuedAt: number;
}

export type Action = string;
export type Resource = string;

export interface User {
  id: string;
  roles: string[];
}

export interface SecurityPolicy {
  [role: string]: {
    allow: Array<{ resource: Resource; actions: Action[] }>;
  };
}

export class SecurityManager {
  private tokens = new Map<string, AuthToken>();
  private users = new Map<string, User>();
  private policy: SecurityPolicy = {};

  addUser(user: User): void {
    this.users.set(user.id, user);
  }

  setPolicy(policy: SecurityPolicy): void {
    this.policy = policy;
  }

  async authenticate(credentials: Credentials): Promise<AuthToken> {
    // demo: accept any known user-id, ignore password
    const id = credentials.user;
    if (!this.users.has(id)) throw new Error("Unknown user");
    const token: AuthToken = {
      token: `${id}.${Math.random().toString(36).slice(2)}`,
      user: id,
      issuedAt: Date.now(),
    };
    this.tokens.set(token.token, token);
    return token;
  }

  async validateToken(token: AuthToken | string): Promise<boolean> {
    const t = typeof token === "string" ? this.tokens.get(token) : this.tokens.get(token.token);
    return !!t;
  }

  async authorize(user: User, resource: Resource, action: Action): Promise<boolean> {
    for (const role of user.roles) {
      const rules = this.policy[role]?.allow || [];
      for (const rule of rules) {
        if (rule.resource === resource && rule.actions.includes(action)) return true;
      }
    }
    return false;
  }

  enforcePolicy(policy: SecurityPolicy): void {
    this.setPolicy(policy);
  }

  logAccess(_user: User, _resource: Resource, _action: Action): void {
    // integrate with real audit logger later
  }

  async generateAuditReport(_criteria: unknown): Promise<unknown> {
    return { entries: 0 };
  }
}

