"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_RPC_ERROR = exports.JsonRpcResponseSchema = exports.JsonRpcErrorSchema = exports.JsonRpcRequestSchema = exports.IdSchema = exports.JsonRpcVersion = exports.z = void 0;
exports.makeError = makeError;
exports.makeResult = makeResult;
exports.isRequest = isRequest;
exports.isNotification = isNotification;
var zod_1 = require("zod");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return zod_1.z; } });
const zod_2 = require("zod");
// JSON-RPC 2.0 base schemas
exports.JsonRpcVersion = zod_2.z.literal("2.0");
exports.IdSchema = zod_2.z.union([zod_2.z.string(), zod_2.z.number(), zod_2.z.null()]);
exports.JsonRpcRequestSchema = zod_2.z.object({
    jsonrpc: exports.JsonRpcVersion,
    id: exports.IdSchema.optional(), // notifications omit id
    method: zod_2.z.string(),
    params: zod_2.z.unknown().optional(),
});
exports.JsonRpcErrorSchema = zod_2.z.object({
    code: zod_2.z.number(),
    message: zod_2.z.string(),
    data: zod_2.z.unknown().optional(),
});
exports.JsonRpcResponseSchema = zod_2.z
    .object({
    jsonrpc: exports.JsonRpcVersion,
    id: exports.IdSchema,
    result: zod_2.z.unknown().optional(),
    error: exports.JsonRpcErrorSchema.optional(),
})
    .superRefine((data, ctx) => {
    const hasResult = typeof data.result !== "undefined";
    const hasError = typeof data.error !== "undefined";
    if (hasResult === hasError) {
        ctx.addIssue({
            code: zod_2.z.ZodIssueCode.custom,
            message: "Response must have exactly one of result or error",
        });
    }
});
// JSON-RPC 2.0 error codes (subset + MCP-specific common)
exports.JSON_RPC_ERROR = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
};
function makeError(id, code, message, data) {
    return {
        jsonrpc: "2.0",
        id: id ?? null,
        error: { code, message, data },
    };
}
function makeResult(id, result) {
    return { jsonrpc: "2.0", id: id ?? null, result };
}
function isRequest(msg) {
    return msg.method !== undefined;
}
function isNotification(req) {
    return typeof req.id === "undefined";
}
//# sourceMappingURL=jsonrpc.js.map