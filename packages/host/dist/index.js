"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BMadMCPHost = void 0;
const agent_registry_1 = require("@bmad/agent-registry");
const context_manager_1 = require("@bmad/context-manager");
const security_manager_1 = require("@bmad/security-manager");
const server_core_1 = require("@bmad/server-core");
const mcp_client_1 = require("@bmad/mcp-client");
class BMadMCPHost {
    constructor() {
        this.agentRegistry = new agent_registry_1.AgentRegistry();
        this.contextManager = new context_manager_1.ContextManager();
        this.securityManager = new security_manager_1.SecurityManager();
        this.clientManager = new mcp_client_1.MCPClientManager(this.agentRegistry, { name: "BMAD Host", version: "0.1.0" });
    }
    async initializeAgent(agentId, name) {
        this.agentRegistry.register({ id: agentId, name });
        // For demo purposes, spin up an in-memory server instance
        const transport = new server_core_1.MemoryTransport();
        const server = new server_core_1.McpServer(transport, { name });
        await server.start();
    }
    async connectStdioServer(id, name, command, args = []) {
        await this.clientManager.connect({ id, name, command, args });
    }
    addUser(user) {
        this.securityManager.addUser(user);
    }
}
exports.BMadMCPHost = BMadMCPHost;
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
//# sourceMappingURL=index.js.map