import { asJsonRpcError } from "./errors";

type Handler = (params: any, ctx: any) => Promise<any>;
const handlers = new Map<string, Handler>();

export function register(method: string, fn: Handler) {
  handlers.set(method, fn);
}
export function listMethods() {
  return Array.from(handlers.keys());
}

export async function runStdioServer(makeCtx: () => Promise<any>) {
  const ctx = await makeCtx();
  process.stdin.setEncoding("utf-8");
  let buffer = "";

  process.stdin.on("data", async (chunk) => {
    buffer += chunk;
    let sep;
    while ((sep = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, sep).trim();
      buffer = buffer.slice(sep + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.method === "rpc.discover") {
          const res = {
            jsonrpc: "2.0",
            id: msg.id,
            result: { methods: listMethods() },
          };
          process.stdout.write(JSON.stringify(res) + "\n");
          continue;
        }
        const fn = handlers.get(msg.method);
        if (!fn) throw new Error(`Method not found: ${msg.method}`);
        const result = await fn(msg.params ?? {}, ctx);
        process.stdout.write(
          JSON.stringify({ jsonrpc: "2.0", id: msg.id, result }) + "\n"
        );
      } catch (e: any) {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: asJsonRpcError(e),
          }) + "\n"
        );
      }
    }
  });

  process.stdout.write(
    JSON.stringify({ jsonrpc: "2.0", method: "server.ready", params: {} }) +
      "\n"
  );
}
