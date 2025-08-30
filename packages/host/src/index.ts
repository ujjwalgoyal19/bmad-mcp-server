import { AgentRegistry } from "@bmad/agent-registry";
import { ContextManager } from "@bmad/context-manager";
import { SecurityManager, User } from "@bmad/security-manager";
import { McpServer, MemoryTransport } from "@bmad/server-core";
import { MCPClientManager } from "@bmad/mcp-client";

export class BMadMCPHost {
  agentRegistry = new AgentRegistry();
  contextManager = new ContextManager();
  securityManager = new SecurityManager();
  clientManager = new MCPClientManager(this.agentRegistry, { name: "BMAD Host", version: "0.1.0" });

  async initializeAgent(agentId: string, name: string): Promise<void> {
    this.agentRegistry.register({ id: agentId, name });
    // For demo purposes, spin up an in-memory server instance
    const transport = new MemoryTransport();
    const server = new McpServer(transport, { name });
    await server.start();
  }

  async connectStdioServer(id: string, name: string, command: string, args: string[] = []): Promise<void> {
    await this.clientManager.connect({ id, name, command, args });
  }

  addUser(user: User): void {
    this.securityManager.addUser(user);
  }
}

async function main() {
  const host = new BMadMCPHost();
  host.addUser({ id: "admin", roles: ["admin"] });
  await host.initializeAgent("analyst-1", "Analyst Server");
  // If you have an installed MCP server on PATH, uncomment and set the command:
  // await host.connectStdioServer("my-mcp", "My MCP Server", "my-mcp-binary", ["--flag"]); 
  // eslint-disable-next-line no-console
  console.log("Registered agents:", host.agentRegistry.list().map(a => a.name));
}

if (require.main === module) {
  void main();
}
