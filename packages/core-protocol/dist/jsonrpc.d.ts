export { z } from "zod";
import { z } from "zod";
export declare const JsonRpcVersion: z.ZodLiteral<"2.0">;
export declare const IdSchema: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodNull]>;
export declare const JsonRpcRequestSchema: z.ZodObject<{
    jsonrpc: z.ZodLiteral<"2.0">;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodNull]>>;
    method: z.ZodString;
    params: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    jsonrpc: "2.0";
    method: string;
    params?: unknown;
    id?: string | number | null | undefined;
}, {
    jsonrpc: "2.0";
    method: string;
    params?: unknown;
    id?: string | number | null | undefined;
}>;
export type JsonRpcRequest = z.infer<typeof JsonRpcRequestSchema>;
export declare const JsonRpcErrorSchema: z.ZodObject<{
    code: z.ZodNumber;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    code: number;
    message: string;
    data?: unknown;
}, {
    code: number;
    message: string;
    data?: unknown;
}>;
export type JsonRpcError = z.infer<typeof JsonRpcErrorSchema>;
export declare const JsonRpcResponseSchema: z.ZodEffects<z.ZodObject<{
    jsonrpc: z.ZodLiteral<"2.0">;
    id: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodNull]>;
    result: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodNumber;
        message: z.ZodString;
        data: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        code: number;
        message: string;
        data?: unknown;
    }, {
        code: number;
        message: string;
        data?: unknown;
    }>>;
}, "strip", z.ZodTypeAny, {
    jsonrpc: "2.0";
    id: string | number | null;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    } | undefined;
}, {
    jsonrpc: "2.0";
    id: string | number | null;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    } | undefined;
}>, {
    jsonrpc: "2.0";
    id: string | number | null;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    } | undefined;
}, {
    jsonrpc: "2.0";
    id: string | number | null;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    } | undefined;
}>;
export type JsonRpcResponse = z.infer<typeof JsonRpcResponseSchema>;
export type JsonRpcMessage = JsonRpcRequest | JsonRpcResponse;
export declare const JSON_RPC_ERROR: {
    readonly PARSE_ERROR: -32700;
    readonly INVALID_REQUEST: -32600;
    readonly METHOD_NOT_FOUND: -32601;
    readonly INVALID_PARAMS: -32602;
    readonly INTERNAL_ERROR: -32603;
};
export declare function makeError(id: JsonRpcResponse["id"], code: number, message: string, data?: unknown): JsonRpcResponse;
export declare function makeResult(id: JsonRpcResponse["id"], result?: unknown): JsonRpcResponse;
export declare function isRequest(msg: JsonRpcMessage): msg is JsonRpcRequest;
export declare function isNotification(req: JsonRpcRequest): boolean;
//# sourceMappingURL=jsonrpc.d.ts.map