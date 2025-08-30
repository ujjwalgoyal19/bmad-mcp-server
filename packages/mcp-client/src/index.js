"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClientManager = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
class MCPClientManager {
    constructor(registry, clientInfo = { name: "BMAD Host", version: "0.1.0" }) {
        this.registry = registry;
        this.clientInfo = clientInfo;
        this.clients = new Map();
    }
    async connect(config, options) {
        if (this.clients.has(config.id))
            return this.clients.get(config.id);
        const transport = new stdio_js_1.StdioClientTransport({
            command: config.command,
            args: config.args,
            env: config.env,
            cwd: config.cwd,
            stderr: config.stderr,
        });
        const client = new index_js_1.Client({ name: this.clientInfo.name, version: this.clientInfo.version }, options);
        await client.connect(transport);
        this.registry.register({ id: config.id, name: config.name });
        const connected = { id: config.id, name: config.name, client };
        this.clients.set(config.id, connected);
        return connected;
    }
    get(id) {
        return this.clients.get(id);
    }
    list() {
        return [...this.clients.values()];
    }
}
exports.MCPClientManager = MCPClientManager;
//# sourceMappingURL=index.js.map