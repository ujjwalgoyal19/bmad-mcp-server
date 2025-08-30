import { describe, it, expect } from "vitest";
import { McpServer } from "../src/mcpServer";
import { MemoryTransport } from "../src/transport";

describe("McpServer core handling", () => {
  it("responds to initialize with capabilities", async () => {
    const transport = new MemoryTransport();
    const server = new McpServer(transport, { name: "test-server", version: "0.0.1" });
    await server.start();

    transport.receive({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2024-11-05" },
    } as any);

    await new Promise((r) => setTimeout(r, 5));

    expect(transport.inbox.length).toBe(1);
    const msg = transport.inbox[0] as any;
    expect(msg.id).toBe(1);
    expect(msg.result.protocolVersion).toBeDefined();
    expect(msg.result.serverInfo.name).toBe("test-server");
  });

  it("returns method not found for unknown methods", async () => {
    const transport = new MemoryTransport();
    const server = new McpServer(transport, { name: "test-server" });
    await server.start();

    transport.receive({ jsonrpc: "2.0", id: 2, method: "unknown" } as any);
    await new Promise((r) => setTimeout(r, 5));

    const msg = transport.inbox[0] as any;
    expect(msg.error).toBeDefined();
    expect(msg.error.code).toBe(-32601);
  });

  it("does not respond to notifications", async () => {
    const transport = new MemoryTransport();
    const server = new McpServer(transport, { name: "test-server" });
    await server.start();

    transport.receive({ jsonrpc: "2.0", method: "ping" } as any);
    await new Promise((r) => setTimeout(r, 5));

    expect(transport.inbox.length).toBe(0);
  });

  it("returns invalid request for bad JSON-RPC shape", async () => {
    const transport = new MemoryTransport();
    const server = new McpServer(transport, { name: "test-server" });
    await server.start();

    transport.receive({ jsonrpc: "1.0", id: 99, method: "initialize" } as any);
    await new Promise((r) => setTimeout(r, 5));

    expect(transport.inbox.length).toBe(1);
    const msg = transport.inbox[0] as any;
    expect(msg.id).toBeNull();
    expect(msg.error).toBeDefined();
    expect(msg.error.code).toBe(-32600);
  });
});

