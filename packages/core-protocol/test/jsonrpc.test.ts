import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  JsonRpcRequestSchema,
  JsonRpcResponseSchema,
  makeError,
  makeResult,
  JSON_RPC_ERROR,
} from "../src/jsonrpc";

describe("JSON-RPC 2.0 schemas", () => {
  it("validates a request", () => {
    const req = { jsonrpc: "2.0", id: 1, method: "echo", params: { x: 1 } };
    expect(JsonRpcRequestSchema.parse(req)).toEqual(req);
  });

  it("rejects invalid version", () => {
    expect(() =>
      JsonRpcRequestSchema.parse({ jsonrpc: "1.0", id: 1, method: "x" })
    ).toThrow(z.ZodError);
  });

  it("validates a response result", () => {
    const res = makeResult(1, { ok: true });
    expect(JsonRpcResponseSchema.parse(res)).toEqual(res);
  });

  it("validates an error response", () => {
    const err = makeError(1, JSON_RPC_ERROR.METHOD_NOT_FOUND, "nope");
    expect(JsonRpcResponseSchema.parse(err)).toEqual(err);
  });

  it("rejects a response with both result and error", () => {
    expect(() =>
      JsonRpcResponseSchema.parse({
        jsonrpc: "2.0",
        id: 1,
        result: { ok: true },
        error: { code: -32603, message: "boom" },
      })
    ).toThrow(z.ZodError);
  });

  it("rejects a response with neither result nor error", () => {
    expect(() =>
      JsonRpcResponseSchema.parse({ jsonrpc: "2.0", id: 1 })
    ).toThrow(z.ZodError);
  });
});

