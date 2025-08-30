import { z } from "@bmad/core-protocol";
import {
  JSON_RPC_ERROR,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcRequestSchema,
  makeError,
  makeResult,
  isNotification,
} from "@bmad/core-protocol";
import type { Transport } from "./transport";

// Minimal MCP initialize request/response
const InitializeParamsSchema = z.object({
  protocolVersion: z.string().optional(),
  capabilities: z.record(z.any()).optional(),
});

const InitializeResultSchema = z.object({
  protocolVersion: z.string(),
  capabilities: z.record(z.any()).default({}),
  serverInfo: z
    .object({ name: z.string(), version: z.string().optional() })
    .optional(),
});

export type InitializeParams = z.infer<typeof InitializeParamsSchema>;
export type InitializeResult = z.infer<typeof InitializeResultSchema>;

export type Handler = (
  params: unknown,
  request: JsonRpcRequest
)=> Promise<unknown> | unknown;

export interface McpServerOptions {
  name: string;
  version?: string;
  protocolVersion?: string; // default to "2024-11-05" (example)
}

export class McpServer {
  private transport: Transport;
  private handlers = new Map<string, Handler>();
  private initialized = false;
  private readonly opts: Required<McpServerOptions>;

  constructor(transport: Transport, opts: McpServerOptions) {
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

  on(method: string, handler: Handler): void {
    this.handlers.set(method, handler);
  }

  async start(): Promise<void> {
    this.transport.onMessage((msg) => this.dispatch(msg));
    await this.transport.start();
  }

  async stop(): Promise<void> {
    await this.transport.stop();
  }

  private async dispatch(raw: any): Promise<void> {
    // Validate JSON-RPC structure
    const parse = JsonRpcRequestSchema.safeParse(raw);
    if (!parse.success) {
      // If we cannot parse, we can't know the id. Use null.
      await this.transport.send(
        makeError(null, JSON_RPC_ERROR.INVALID_REQUEST, "Invalid request")
      );
      return;
    }

    const req = parse.data;
    const handler = this.handlers.get(req.method);
    if (!handler) {
      if (!isNotification(req)) {
        await this.transport.send(
          makeError(req.id ?? null, JSON_RPC_ERROR.METHOD_NOT_FOUND, "Method not found")
        );
      }
      return;
    }

    try {
      const result = await handler(req.params, req);
      if (!isNotification(req)) {
        await this.transport.send(makeResult(req.id ?? null, result));
      }
    } catch (err: any) {
      if (!isNotification(req)) {
        await this.transport.send(
          makeError(
            req.id ?? null,
            JSON_RPC_ERROR.INTERNAL_ERROR,
            err?.message ?? "Internal error"
          )
        );
      }
    }
  }

  private handleInitialize(params: unknown, req: JsonRpcRequest): InitializeResult {
    const parsed = InitializeParamsSchema.parse(params ?? {});
    this.initialized = true;
    return InitializeResultSchema.parse({
      protocolVersion: this.opts.protocolVersion,
      capabilities: {},
      serverInfo: { name: this.opts.name, version: this.opts.version },
    });
  }
}

