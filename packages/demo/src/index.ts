import { McpServer, MemoryTransport } from "@bmad/server-core";

async function main() {
  const transport = new MemoryTransport();
  const server = new McpServer(transport, {
    name: "bmad-mcp",
    version: "0.1.0",
  });

  await server.start();

  transport.receive({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2024-11-05" },
  } as any);

  setTimeout(() => {
    // eslint-disable-next-line no-console
    console.log("Outgoing messages:", transport.inbox);
  }, 10);
}

void main();

