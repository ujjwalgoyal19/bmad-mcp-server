import type { AgentRegistry } from "@bmad/agent-registry";
import type { ClientOptions } from "@modelcontextprotocol/sdk/client/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { type StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio.js";
export interface MCPServerConfig extends StdioServerParameters {
    id: string;
    name: string;
}
export interface ConnectedServer {
    id: string;
    name: string;
    client: Client;
}
export declare class MCPClientManager {
    private readonly registry;
    private readonly clientInfo;
    private clients;
    constructor(registry: AgentRegistry, clientInfo?: {
        name: string;
        version: string;
    });
    connect(config: MCPServerConfig, options?: ClientOptions): Promise<ConnectedServer>;
    get(id: string): ConnectedServer | undefined;
    list(): ConnectedServer[];
}
//# sourceMappingURL=index.d.ts.map