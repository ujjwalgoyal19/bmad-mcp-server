import { startOrResumeProject } from "@bmad/mcp-core";
import { makeDb } from "@bmad/mcp-db";
import { makeNoopEmbeddings, makeS3Storage } from "@bmad/mcp-storage";
import { ensureAuth } from "./auth";

export async function makeServerContext() {
  const { db } = await makeDb(process.env.DATABASE_URL);
  const storage = makeS3Storage({
    endpoint: process.env.S3_ENDPOINT!,
    bucket: process.env.S3_BUCKET!,
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  });
  const embeddings = makeNoopEmbeddings();
  const tokens = await ensureAuth();

  // Resolve on startup; MCP hosts typically call a discovery method first
  const boot = await startOrResumeProject(
    { db, storage, embeddings },
    // Hints: repo URL/path if available; for now use cwd name
    {
      name: process.cwd(),
      gitRepoUrl: process.env.GIT_REMOTE_URL,
      gitRepoPath: process.cwd(),
    },
    { name: "bmad-mcp-cli", version: "dev" }
  );

  return {
    db,
    storage,
    embeddings,
    session: { projectId: boot.projectId, sessionId: boot.sessionId },
    auth: tokens,
  };
}
