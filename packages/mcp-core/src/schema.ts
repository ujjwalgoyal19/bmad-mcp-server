import { z } from "zod";

export const StartOrResumeInput = z
  .object({
    project_hint: z.string().optional(),
    git_repo_url: z.string().url().optional(),
    git_repo_path: z.string().optional(),
  })
  .partial();

export const StartOrResumeOutput = z.object({
  project_id: z.string(),
  created: z.boolean(),
});

export const AttachGitInput = z
  .object({
    project_id: z.string(),
    git_repo_url: z.string().url().optional(),
    git_repo_path: z.string().optional(),
  })
  .refine((d) => d.git_repo_url || d.git_repo_path, {
    message: "Provide git_repo_url or git_repo_path",
  });

export const AttachGitOutput = z.object({ ok: z.boolean() });

export const SaveTextInput = z.object({
  project_id: z.string(),
  uri: z.string().min(3),
  mime: z.string().min(3),
  content: z.string(),
  title: z.string().optional(),
});

export const SaveTextOutput = z.object({ resource_id: z.string() });

export const SnapshotInput = z.object({
  project_id: z.string(),
  label: z.string().optional(),
  git_sha: z.string().optional(),
});
export const SnapshotOutput = z.object({ snapshot_id: z.string() });

export const ResourcesListInput = z.object({
  project_id: z.string(),
  filter: z
    .object({
      prefix: z.string().optional(),
      mime: z.string().optional(),
      updated_after: z.string().datetime().optional(),
      updated_before: z.string().datetime().optional(),
    })
    .optional(),
});
export const ResourceListItem = z.object({
  id: z.string(),
  uri: z.string(),
  title: z.string().nullish(),
  mime: z.string().nullish(),
  updated_at: z.string(),
  latest_blob_id: z.string().nullish(),
});
export const ResourcesListOutput = z.array(ResourceListItem);

export const MemorySearchInput = z.object({
  project_id: z.string(),
  query: z.string(),
  top_k: z.number().int().min(1).max(32).default(8),
});
export const MemorySearchHit = z.object({
  resource_id: z.string(),
  blob_id: z.string(),
  uri: z.string(),
  title: z.string().nullish(),
  excerpt: z.string(),
  score: z.number(),
});
export const MemorySearchOutput = z.array(MemorySearchHit);

export type StartOrResumeInputT = z.infer<typeof StartOrResumeInput>;
export type StartOrResumeOutputT = z.infer<typeof StartOrResumeOutput>;
export type AttachGitInputT = z.infer<typeof AttachGitInput>;
export type SaveTextInputT = z.infer<typeof SaveTextInput>;
export type ResourcesListInputT = z.infer<typeof ResourcesListInput>;
export type MemorySearchInputT = z.infer<typeof MemorySearchInput>;
export type SnapshotInputT = z.infer<typeof SnapshotInput>;
export type SnapshotOutputT = z.infer<typeof SnapshotOutput>;
