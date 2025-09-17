export interface Project {
  id: string;
  name: string;
  gitRepoUrl?: string | null;
  gitRepoPath?: string | null;
}
export interface Session {
  id: string;
  projectId: string;
  clientName?: string | null;
  clientVer?: string | null;
}

export interface DbPort {
  findProjectByRepo(
    url?: string | null,
    path?: string | null
  ): Promise<Project | null>;
  findProjectByName(name: string): Promise<Project | null>;
  createProject(data: Partial<Project>): Promise<Project>;
  createSession(data: Partial<Session>): Promise<Session>;
  upsertResource(
    projectId: string,
    uri: string,
    meta: { mime?: string; title?: string; description?: string }
  ): Promise<{ id: string }>;
  createBlob(
    resourceId: string,
    sha256: string,
    size: number,
    storageUrl: string
  ): Promise<{ id: string }>;
  setLatestBlob(resourceId: string, blobId: string): Promise<void>;
  listResourcesWithLatest(
    projectId: string
  ): Promise<Array<{ id: string; latestBlobId?: string | null }>>;
  createSnapshot(
    projectId: string,
    manifest: Record<string, string>,
    gitSha?: string | null,
    label?: string | null
  ): Promise<{ id: string }>;
  attachGit(
    projectId: string,
    data: { gitRepoUrl?: string | null; gitRepoPath?: string | null }
  ): Promise<void>;
  listResources(
    projectId: string,
    filter?: {
      prefix?: string;
      mime?: string;
      updatedAfter?: Date;
      updatedBefore?: Date;
    }
  ): Promise<
    Array<{
      id: string;
      uri: string;
      title?: string | null;
      mime?: string | null;
      updatedAt: Date;
      latestBlobId?: string | null;
    }>
  >;
}

export interface StoragePort {
  putObject(
    key: string,
    body: Uint8Array | string,
    mime: string
  ): Promise<string>; // returns storageUrl
}

export interface EmbeddingPort {
  index(blobId: string, text: string, meta: any): Promise<void>;
  search(
    projectId: string,
    query: string,
    topK: number
  ): Promise<
    Array<{
      resourceId: string;
      blobId: string;
      uri: string;
      title?: string;
      excerpt: string;
      score: number;
    }>
  >;
}
