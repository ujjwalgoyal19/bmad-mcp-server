import {
  saveTextResource,
  snapshot,
  startOrResumeProject,
} from "@bmad/mcp-core";
import { makeDb } from "@bmad/mcp-db";
import { makeNoopEmbeddings, makeS3Storage } from "@bmad/mcp-storage";

// This is a minimal stub to prove wiring; replace with your MCP SDK server.
async function main() {
  const { db: dbPort } = await makeDb(process.env.DATABASE_URL);
  const storage = makeS3Storage({
    endpoint: process.env.S3_ENDPOINT!,
    bucket: process.env.S3_BUCKET!,
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  });
  const embeddings = makeNoopEmbeddings();

  const ctx = { db: dbPort, storage, embeddings };

  // On host connect → auto project
  const { projectId } = await startOrResumeProject(
    ctx,
    { name: process.cwd() },
    { name: "cli", version: "dev" }
  );
  console.log(`Attached project: ${projectId}`);

  // Demo save (simulate a tool call)
  await saveTextResource(
    ctx,
    projectId,
    "doc://PRD.md",
    "text/markdown",
    "# PRD\nHello",
    "PRD"
  );
  const snap = await snapshot(ctx, projectId, undefined, "init");
  console.log(`Snapshot: ${snap.id}`);

  // TODO: Replace with real MCP transport handling (stdio JSON-RPC)
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
