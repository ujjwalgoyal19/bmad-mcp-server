import { startOrResumeProject } from "@bmad/mcp-core";
import { makeDb } from "@bmad/mcp-db";
import { makeNoopEmbeddings, makeS3Storage } from "@bmad/mcp-storage";
import { serve } from "bun"; // simple WS

const PORT = Number(process.env.PORT ?? 8714);

const { db } = await makeDb(process.env.DATABASE_URL);
const storage = makeS3Storage({
  endpoint: process.env.S3_ENDPOINT!,
  bucket: process.env.S3_BUCKET!,
  accessKeyId: process.env.S3_ACCESS_KEY!,
  secretAccessKey: process.env.S3_SECRET_KEY!,
});
const embeddings = makeNoopEmbeddings();

serve({
  port: PORT,
  fetch(req, server) {
    if (server.upgrade(req)) return undefined!;
    return new Response("bmad-mcp ws", { status: 200 });
  },
  websocket: {
    open(ws) {
      ws.send("hello ws client");
    },
    message: async (ws, msg) => {
      // TODO: parse JSON-RPC, dispatch to core; for now just auto-create a project
      const { projectId } = await startOrResumeProject(
        { db, storage, embeddings },
        { name: "ws" },
        { name: "ws", version: "dev" }
      );
      ws.send(JSON.stringify({ ok: true, projectId }));
    },
  },
});
console.log(`WS listening on :${PORT}`);
