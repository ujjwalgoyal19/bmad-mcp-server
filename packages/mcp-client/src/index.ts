import type { AgentRegistry } from "@bmad/agent-registry";
import type { ClientOptions } from "@modelcontextprotocol/sdk/client/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport, type StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio.js";

export interface MCPServerConfig extends StdioServerParameters {
  id: string;
  name: string;
}

export interface ConnectedServer {
  id: string;
  name: string;
  client: Client;
}

export class MCPClientManager {
  private clients = new Map<string, ConnectedServer>();
  constructor(private readonly registry: AgentRegistry, private readonly clientInfo: { name: string; version: string } = { name: "BMAD Host", version: "0.1.0" }) {}

  async connect(config: MCPServerConfig, options?: ClientOptions): Promise<ConnectedServer> {
    if (this.clients.has(config.id)) return this.clients.get(config.id)!;
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: config.env,
      cwd: config.cwd,
      stderr: config.stderr,
    });
    const client = new Client({ name: this.clientInfo.name, version: this.clientInfo.version }, options);
    await client.connect(transport);
    this.registry.register({ id: config.id, name: config.name });
    const connected: ConnectedServer = { id: config.id, name: config.name, client };
    this.clients.set(config.id, connected);
    return connected;
  }

  get(id: string): ConnectedServer | undefined {
    return this.clients.get(id);
  }

  list(): ConnectedServer[] {
    return [...this.clients.values()];
  }
}
