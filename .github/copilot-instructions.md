# Copilot / AI agent instructions — bmad-mcp-server

Purpose: give an AI coding agent the minimal, high-value context to be immediately productive in this monorepo.

1. Big picture (what to know first)

- Monorepo (turborepo style): top-level `apps/`, `packages/`, `infra/`, `shared-config/`.
- Runtime: Bun (see `README.md` and `.github/workflows/ci.yml`). CI uses `oven-sh/setup-bun` and `bunx turbo run ...`.
- Primary responsibilities:
  - `packages/mcp-core` — business logic + small SDK surface. Defines `Ctx` and port interfaces (`DbPort`, `StoragePort`, `EmbeddingPort`) in `src/ports.ts` and core flows in `src/server.ts`.
  - `packages/mcp-db` — Prisma-backed `DbPort` implementation (`src/index.ts`) using `packages/mcp-db/prisma/schema.prisma`.
  - `packages/mcp-storage` — S3/MinIO storage and a placeholder embedding port (`src/index.ts`).
  - `apps/mcp-server-cli` and `apps/mcp-server-ws` — example entrypoints that wire the ports and demonstrate runtime behavior.

2. Key patterns and conventions (explicit, discoverable)

- Dependency injection via a `Ctx` object (see `packages/mcp-core/src/server.ts`) — always look for `ctx` containing `{ db, storage, embeddings }`.
- Port interfaces live in `packages/mcp-core/src/ports.ts`. Implementations are factory functions named `makeX` (e.g. `makeDb`, `makeS3Storage`, `makeNoopEmbeddings`). Use those factories when wiring.
- Data flow example (concrete): `saveTextResource` in `packages/mcp-core/src/server.ts`:
  - upsert resource (DB) -> create blob (DB) -> put object (storage) -> set latest blob (DB) -> embeddings.index(...)
  - Use this function as canonical example of cross-package interactions.
- DB model: Prisma schema in `packages/mcp-db/prisma/schema.prisma` (projects, sessions, resources, blobs, snapshots, embeddings). `mcp-db` uses `PrismaClient` directly.
- Storage: `makeS3Storage` uses AWS SDK S3 client and returns `s3://bucket/key` URLs; default local infra uses MinIO defined in `infra/docker-compose.yml`.

3. Environment, infra and local run notes (concrete commands)

- CI shows canonical commands (use `bun`/`bunx`):

```pwsh
# install deps
bun install

# monorepo tasks
bunx turbo run build
bunx turbo run typecheck
bunx turbo run lint
```

- Local infra (docker-compose) is provided at `infra/docker-compose.yml` and includes Postgres+pgvector, MinIO, Redis, Qdrant. MinIO creds in the compose file:
  - MINIO_ROOT_USER=minio
  - MINIO_ROOT_PASSWORD=minio123

- Minimal env examples (set these before running the apps):

```pwsh
$env:DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/bmad'
$env:S3_ENDPOINT   = 'http://localhost:9000'
$env:S3_BUCKET     = 'bmad'
$env:S3_ACCESS_KEY = 'minio'
$env:S3_SECRET_KEY = 'minio123'
```

- Run the CLI example (wires DB + storage + noop embeddings):

```pwsh
bun run apps/mcp-server-cli/src/index.ts
```

4. Integration points and where to change behavior

- Replace/noop embeddings: `packages/mcp-storage/src/index.ts` currently exports `makeNoopEmbeddings()` — swap this for a real embedding/indexing client (pgvector, Qdrant, etc.) and honor the `EmbeddingPort` contract in `packages/mcp-core/src/ports.ts`.
- Prisma/DB: `packages/mcp-db/src/index.ts` is the single Prisma-backed `DbPort`. If you change `schema.prisma`, update the generated client and migrations (standard Prisma flow). The project expects `DATABASE_URL` in env.
- Storage: `makeS3Storage` speaks S3 and expects `S3_ENDPOINT`/`S3_BUCKET` environment values; local dev uses MinIO in `infra/docker-compose.yml`.

5. Files to inspect first (high-signal)

- `packages/mcp-core/src/ports.ts` — ports + types
- `packages/mcp-core/src/server.ts` — core flows: project/session lifecycle, saveTextResource, snapshot
- `packages/mcp-db/src/index.ts` — Prisma implementation of DbPort
- `packages/mcp-storage/src/index.ts` — S3 storage and noop embeddings stub
- `apps/mcp-server-cli/src/index.ts` and `apps/mcp-server-ws/src/index.ts` — runtime wiring and minimal example servers
- `packages/mcp-db/prisma/schema.prisma` — canonical data model
- `infra/docker-compose.yml` — development services and credentials

6. Quick heuristics for PRs and edits

- When changing data shapes, update `schema.prisma` and the Prisma client usage inside `packages/mcp-db` before other packages rely on the change.
- Keep the `Ctx`/port surface stable; introduce new methods on port interfaces only when all consumers are updated or provide adapters in `packages/*`.
- Use the factories (`makeDb`, `makeS3Storage`, etc.) to add instrumentation (logging/metrics) in one place.

7. What the agent should not assume

- Embeddings are currently a no-op — searches and ranked results are not implemented (do not rely on production embedding behavior).
- No global config file enforces runtime env names; read usages in `apps/*` and factories for required env variables.

If anything above is unclear or you want more detail on a specific subsystem (Prisma migrations, embedding integration, or build/release for `apps/mcp-server-cli`), tell me which area to expand and I will iterate.
