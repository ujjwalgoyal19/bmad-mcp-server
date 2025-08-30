"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_core_1 = require("@bmad/server-core");
async function main() {
    const transport = new server_core_1.MemoryTransport();
    const server = new server_core_1.McpServer(transport, {
        name: "bmad-mcp",
        version: "0.1.0",
    });
    await server.start();
    transport.receive({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2024-11-05" },
    });
    setTimeout(() => {
        // eslint-disable-next-line no-console
        console.log("Outgoing messages:", transport.inbox);
    }, 10);
}
void main();
//# sourceMappingURL=index.js.map