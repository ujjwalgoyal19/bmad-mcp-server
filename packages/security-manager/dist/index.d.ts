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
        allow: Array<{
            resource: Resource;
            actions: Action[];
        }>;
    };
}
export declare class SecurityManager {
    private tokens;
    private users;
    private policy;
    addUser(user: User): void;
    setPolicy(policy: SecurityPolicy): void;
    authenticate(credentials: Credentials): Promise<AuthToken>;
    validateToken(token: AuthToken | string): Promise<boolean>;
    authorize(user: User, resource: Resource, action: Action): Promise<boolean>;
    enforcePolicy(policy: SecurityPolicy): void;
    logAccess(_user: User, _resource: Resource, _action: Action): void;
    generateAuditReport(_criteria: unknown): Promise<unknown>;
}
//# sourceMappingURL=index.d.ts.map