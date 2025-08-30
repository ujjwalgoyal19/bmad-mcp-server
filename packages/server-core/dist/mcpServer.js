"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServer = void 0;
const core_protocol_1 = require("@bmad/core-protocol");
const core_protocol_2 = require("@bmad/core-protocol");
// Minimal MCP initialize request/response
const InitializeParamsSchema = core_protocol_1.z.object({
    protocolVersion: core_protocol_1.z.string().optional(),
    capabilities: core_protocol_1.z.record(core_protocol_1.z.any()).optional(),
});
const InitializeResultSchema = core_protocol_1.z.object({
    protocolVersion: core_protocol_1.z.string(),
    capabilities: core_protocol_1.z.record(core_protocol_1.z.any()).default({}),
    serverInfo: core_protocol_1.z
        .object({ name: core_protocol_1.z.string(), version: core_protocol_1.z.string().optional() })
        .optional(),
});
class McpServer {
    constructor(transport, opts) {
        this.handlers = new Map();
        this.initialized = false;
        this.transport = transport;
        this.opts = {
            protocolVersion: opts.protocolVersion ?? "2024-11-05",
            name: opts.name,
            version: opts.version ?? "0.1.0",
        };
        // Built-in handlers
        this.on("initialize", (params, req) => this.handleInitialize(params, req));
        this.on("ping", () => ({ ok: true }));
    }
    on(method, handler) {
        this.handlers.set(method, handler);
    }
    async start() {
        this.transport.onMessage((msg) => this.dispatch(msg));
        await this.transport.start();
    }
    async stop() {
        await this.transport.stop();
    }
    async dispatch(raw) {
        // Validate JSON-RPC structure
        const parse = core_protocol_2.JsonRpcRequestSchema.safeParse(raw);
        if (!parse.success) {
            // If we cannot parse, we can't know the id. Use null.
            await this.transport.send((0, core_protocol_2.makeError)(null, core_protocol_2.JSON_RPC_ERROR.INVALID_REQUEST, "Invalid request"));
            return;
        }
        const req = parse.data;
        const handler = this.handlers.get(req.method);
        if (!handler) {
            if (!(0, core_protocol_2.isNotification)(req)) {
                await this.transport.send((0, core_protocol_2.makeError)(req.id ?? null, core_protocol_2.JSON_RPC_ERROR.METHOD_NOT_FOUND, "Method not found"));
            }
            return;
        }
        try {
            const result = await handler(req.params, req);
            if (!(0, core_protocol_2.isNotification)(req)) {
                await this.transport.send((0, core_protocol_2.makeResult)(req.id ?? null, result));
            }
        }
        catch (err) {
            if (!(0, core_protocol_2.isNotification)(req)) {
                await this.transport.send((0, core_protocol_2.makeError)(req.id ?? null, core_protocol_2.JSON_RPC_ERROR.INTERNAL_ERROR, err?.message ?? "Internal error"));
            }
        }
    }
    handleInitialize(params, req) {
        const parsed = InitializeParamsSchema.parse(params ?? {});
        this.initialized = true;
        return InitializeResultSchema.parse({
            protocolVersion: this.opts.protocolVersion,
            capabilities: {},
            serverInfo: { name: this.opts.name, version: this.opts.version },
        });
    }
}
exports.McpServer = McpServer;
//# sourceMappingURL=mcpServer.js.map