import { AgentRegistry } from "@bmad/agent-registry";
import { ContextManager } from "@bmad/context-manager";
import { SecurityManager, User } from "@bmad/security-manager";
import { MCPClientManager } from "@bmad/mcp-client";
export declare class BMadMCPHost {
    agentRegistry: AgentRegistry;
    contextManager: ContextManager;
    securityManager: SecurityManager;
    clientManager: MCPClientManager;
    initializeAgent(agentId: string, name: string): Promise<void>;
    connectStdioServer(id: string, name: string, command: string, args?: string[]): Promise<void>;
    addUser(user: User): void;
}
//# sourceMappingURL=index.d.ts.map