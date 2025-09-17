import {
  attachGit,
  AttachGitInput,
  AttachGitInputT,
  AttachGitOutput,
  listProjectResources,
  ResourcesListInput,
  ResourcesListInputT,
  ResourcesListOutput,
  SaveTextInput,
  SaveTextInputT,
  SaveTextOutput,
  saveTextResource,
  snapshot,
  SnapshotInput,
  SnapshotInputT,
  SnapshotOutput,
} from "@bmad/mcp-core";
import { register } from "./rpc";
import { validate } from "./validate";

export function registerMcpMethods() {
  register("tools.list", async () => [
    "projects.start_or_resume",
    "projects.attach_git",
    "resources.save_text",
    "resources.list",
    "projects.snapshot",
    "memory.search",
  ]);

  register("projects.start_or_resume", async (_p, ctx) => ({
    project_id: ctx.session.projectId,
    created: false,
  }));

  register("projects.attach_git", async (p, ctx) => {
    const input = validate<AttachGitInputT>(AttachGitInput, {
      project_id: ctx.session.projectId,
      ...p,
    });
    const res = await attachGit(
      { ...ctx.ports },
      input.project_id,
      input.git_repo_url,
      input.git_repo_path
    );
    return AttachGitOutput.parse(res);
  });

  register("resources.save_text", async (p, ctx) => {
    const input = validate<SaveTextInputT>(SaveTextInput, {
      project_id: ctx.session.projectId,
      ...p,
    });
    const r = await saveTextResource(
      { ...ctx.ports },
      input.project_id,
      input.uri,
      {
        mime: input.mime,
        content: input.content,
        title: input.title,
      }
    );
    return SaveTextOutput.parse({ resource_id: r.resourceId });
  });

  register("resources.list", async (p, ctx) => {
    const input = validate<ResourcesListInputT>(ResourcesListInput, {
      project_id: ctx.session.projectId,
      ...p,
    });
    const items = await listProjectResources(
      { ...ctx.ports },
      input.project_id,
      input.filter as any
    );
    return ResourcesListOutput.parse(items);
  });

  register("projects.snapshot", async (p, ctx) => {
    const input = validate<SnapshotInputT>(SnapshotInput, {
      project_id: ctx.session.projectId,
      ...p,
    });
    const s = await snapshot(ctx, input.project_id, input.git_sha, input.label);
    return SnapshotOutput.parse({ snapshot_id: s.id });
  });

  register("memory.search", async (_p) => []); // Phase 4
}
