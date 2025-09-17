import type { DbPort } from "@bmad/mcp-core";
import { PrismaClient } from "@prisma/client";

export async function makeDb(url = process.env.DATABASE_URL) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });

  const db: DbPort = {
    async findProjectByRepo(url, path) {
      if (!url && !path) return null;
      return prisma.project.findFirst({
        where: {
          OR: [
            { gitRepoUrl: url ?? undefined },
            { gitRepoPath: path ?? undefined },
          ],
        },
      }) as any;
    },
    async findProjectByName(name) {
      return prisma.project.findFirst({ where: { name } }) as any;
    },
    async createProject(data) {
      return prisma.project.create({
        data: {
          name: data.name!,
          gitRepoUrl: data.gitRepoUrl,
          gitRepoPath: data.gitRepoPath,
        },
      }) as any;
    },
    async createSession(data) {
      return prisma.session.create({
        data: {
          projectId: data.projectId!,
          clientName: data.clientName,
          clientVer: data.clientVer,
        },
      }) as any;
    },
    async upsertResource(projectId, uri, meta) {
      const res = await prisma.resource.upsert({
        where: { projectId_uri: { projectId, uri } },
        create: {
          projectId,
          uri,
          mime: meta.mime,
          title: meta.title,
          description: meta.description,
        },
        update: {
          mime: meta.mime,
          title: meta.title,
          description: meta.description,
        },
      });
      return { id: res.id };
    },
    async createBlob(resourceId, sha256, size, storageUrl) {
      const blob = await prisma.resourceBlob.create({
        data: { resourceId, sha256, size: BigInt(size), storageUrl },
      });
      return { id: blob.id };
    },
    async setLatestBlob(resourceId, blobId) {
      await prisma.resource.update({
        where: { id: resourceId },
        data: { latestBlobId: blobId },
      });
    },
    async listResourcesWithLatest(projectId: string) {
      const arr = await prisma.resource.findMany({
        where: { projectId },
        select: { id: true, latestBlobId: true },
      });
      return arr;
    },
    async createSnapshot(projectId, manifest, gitSha, label) {
      const snap = await prisma.snapshot.create({
        data: { projectId, manifest, gitSha, label },
      });
      return { id: snap.id };
    },
    async attachGit(projectId, data) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          gitRepoUrl: data.gitRepoUrl ?? undefined,
          gitRepoPath: data.gitRepoPath ?? undefined,
        },
      });
    },
    async listResources(projectId, filter) {
      return prisma.resource.findMany({
        where: {
          projectId,
          ...(filter?.mime ? { mime: filter.mime } : {}),
          ...(filter?.prefix ? { uri: { startsWith: filter.prefix } } : {}),
          ...(filter?.updatedAfter || filter?.updatedBefore
            ? {
                updatedAt: {
                  gte: filter?.updatedAfter,
                  lte: filter?.updatedBefore,
                },
              }
            : {}),
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          uri: true,
          title: true,
          mime: true,
          updatedAt: true,
          latestBlobId: true,
        },
      }) as any;
    },
  };

  return { prisma, db };
}
