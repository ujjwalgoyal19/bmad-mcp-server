export { z } from "zod";
import { z } from "zod";

// JSON-RPC 2.0 base schemas
export const JsonRpcVersion = z.literal("2.0");

export const IdSchema = z.union([z.string(), z.number(), z.null()]);

export const JsonRpcRequestSchema = z.object({
  jsonrpc: JsonRpcVersion,
  id: IdSchema.optional(), // notifications omit id
  method: z.string(),
  params: z.unknown().optional(),
});

export type JsonRpcRequest = z.infer<typeof JsonRpcRequestSchema>;

export const JsonRpcErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.unknown().optional(),
});

export type JsonRpcError = z.infer<typeof JsonRpcErrorSchema>;

export const JsonRpcResponseSchema = z
  .object({
    jsonrpc: JsonRpcVersion,
    id: IdSchema,
    result: z.unknown().optional(),
    error: JsonRpcErrorSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const hasResult = typeof data.result !== "undefined";
    const hasError = typeof data.error !== "undefined";
    if (hasResult === hasError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Response must have exactly one of result or error",
      });
    }
  });

export type JsonRpcResponse = z.infer<typeof JsonRpcResponseSchema>;

export type JsonRpcMessage = JsonRpcRequest | JsonRpcResponse;

// JSON-RPC 2.0 error codes (subset + MCP-specific common)
export const JSON_RPC_ERROR = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

export function makeError(
  id: JsonRpcResponse["id"],
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message, data },
  };
}

export function makeResult(
  id: JsonRpcResponse["id"],
  result?: unknown
): JsonRpcResponse {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

export function isRequest(msg: JsonRpcMessage): msg is JsonRpcRequest {
  return (msg as any).method !== undefined;
}

export function isNotification(req: JsonRpcRequest): boolean {
  return typeof req.id === "undefined";
}

