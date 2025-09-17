import { createHash } from "node:crypto";
import { DbPort, EmbeddingPort, StoragePort } from "./ports";

export type Ctx = {
  db: DbPort;
  storage: StoragePort;
  embeddings: EmbeddingPort;
  session?: { projectId: string; sessionId: string };
};

export async function startOrResumeProject(
  ctx: Ctx,
  hint?: { name?: string; gitRepoUrl?: string; gitRepoPath?: string },
  client?: { name?: string; version?: string }
) {
  const key = hint?.gitRepoUrl || hint?.gitRepoPath || hint?.name;
  let project = await getExistingProject(ctx, hint, key);

  if (!project) {
    project = await createProjectFromHint(ctx, hint);
  }

  const session = await createSessionForProject(ctx, project.id, client);
  return { projectId: project.id, sessionId: session.id, created: !key };
}

async function getExistingProject(
  ctx: Ctx,
  hint?: { name?: string; gitRepoUrl?: string; gitRepoPath?: string },
  key?: string
) {
  if (hint?.gitRepoUrl || hint?.gitRepoPath) {
    return ctx.db.findProjectByRepo(hint?.gitRepoUrl, hint?.gitRepoPath);
  }
  if (key) {
    return ctx.db.findProjectByName(key);
  }
  return null;
}

async function createProjectFromHint(
  ctx: Ctx,
  hint?: { name?: string; gitRepoUrl?: string; gitRepoPath?: string }
) {
  return ctx.db.createProject({
    name: hint?.gitRepoUrl
      ? hint!.gitRepoUrl
      : (hint?.name ?? `Untitled ${new Date().toISOString()}`),
    gitRepoUrl: hint?.gitRepoUrl,
    gitRepoPath: hint?.gitRepoPath,
  });
}

async function createSessionForProject(
  ctx: Ctx,
  projectId: string,
  client?: { name?: string; version?: string }
) {
  return ctx.db.createSession({
    projectId,
    clientName: client?.name,
    clientVer: client?.version,
  });
}

export async function saveTextResource(
  ctx: Ctx,
  projectId: string,
  uri: string,
  opts: { mime: string; content: string; title?: string }
) {
  const { mime, content, title } = opts;
  const { id: resourceId } = await ctx.db.upsertResource(projectId, uri, {
    mime,
    title,
  });
  const sha = createHash("sha256").update(content).digest("hex");
  const key = `${projectId}/${sha}`;
  const storageUrl = await ctx.storage.putObject(key, content, mime);
  const { id: blobId } = await ctx.db.createBlob(
    resourceId,
    sha,
    Buffer.byteLength(content),
    storageUrl
  );
  await ctx.db.setLatestBlob(resourceId, blobId);
  // embeddings are async in real world; here we call inline for simplicity
  await ctx.embeddings.index(blobId, content, { projectId, uri, mime, title });
  return { resourceId };
}

export async function snapshot(
  ctx: Ctx,
  projectId: string,
  gitSha?: string,
  label?: string
) {
  const list = await ctx.db.listResourcesWithLatest(projectId);
  const manifest: Record<string, string> = {};
  for (const r of list) if (r.latestBlobId) manifest[r.id] = r.latestBlobId!;
  return ctx.db.createSnapshot(projectId, manifest, gitSha, label);
}

export async function attachGit(
  ctx: Ctx,
  projectId: string,
  gitRepoUrl?: string,
  gitRepoPath?: string
) {
  await ctx.db.attachGit(projectId, { gitRepoUrl, gitRepoPath });
  return { ok: true };
}

export async function listProjectResources(
  ctx: Ctx,
  projectId: string,
  filter?: {
    prefix?: string;
    mime?: string;
    updatedAfter?: string;
    updatedBefore?: string;
  }
) {
  const res = await ctx.db.listResources(projectId, {
    prefix: filter?.prefix,
    mime: filter?.mime,
    updatedAfter: filter?.updatedAfter
      ? new Date(filter.updatedAfter)
      : undefined,
    updatedBefore: filter?.updatedBefore
      ? new Date(filter.updatedBefore)
      : undefined,
  });
  return res.map((r) => ({
    id: r.id,
    uri: r.uri,
    title: r.title ?? null,
    mime: r.mime ?? null,
    updated_at: r.updatedAt.toISOString(),
    latest_blob_id: r.latestBlobId ?? null,
  }));
}
