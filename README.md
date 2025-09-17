
# bmad-mcp-server

## BMAD MCP Server — Developer Guide

Welcome to the BMAD Model Context Protocol (MCP) server monorepo — the developer-focused entry point for contributors and maintainers.

This repository implements a scalable, port-based Model Context Protocol server that manages AI context across multiple projects. It provides a CLI, a WebSocket server for real-time workflows, Prisma-backed PostgreSQL persistence, S3-compatible blob storage, and an embedding/indexing surface.

## Project overview

- Purpose: provide a modular, production-ready implementation of the Model Context Protocol to store, index, and surface project-level context for AI systems.
- Architecture: port-and-adapter (dependency injection via a `Ctx` object) letting the core logic stay framework-agnostic while concrete packages provide DB, storage, and embedding adapters.
- Key scenarios: multi-project context management, snapshotting resources, blob storage, and (pluggable) semantic search using embeddings.

## Key features

- Port-based architecture with `mcp-core` exposing stable interfaces.
- Prisma + PostgreSQL persistence implemented in `packages/mcp-db`.
- S3/MinIO-compatible storage adapter in `packages/mcp-storage`.
- Example runtime entrypoints: `apps/mcp-server-cli` (CLI) and `apps/mcp-server-ws` (WebSocket server).
- Docs site in `apps/docs/` for end-user guides and examples.

## Quick start (developer)

Prerequisites:

- Bun (recommended runtime). See project CI which uses `oven-sh/setup-bun`.
- Docker (for local infra) and docker-compose.
- PostgreSQL and MinIO available via `infra/docker-compose.yml` for local development.

1. Install dependencies:

```pwsh
bun install
```

1. Start local infra (Postgres, MinIO, etc.) for development:

```pwsh
docker compose -f infra/docker-compose.yml up -d
```

1. Set required environment variables (example):

```pwsh
$env:DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/bmad'
$env:S3_ENDPOINT   = 'http://localhost:9000'
$env:S3_BUCKET     = 'bmad'
$env:S3_ACCESS_KEY = 'minio'
$env:S3_SECRET_KEY = 'minio123'
```

1. Run the CLI example wiring DB + storage (noop embeddings):

```pwsh
bun run apps/mcp-server-cli/src/index.ts
```

For full developer setup, see `DEVELOPER_GUIDE.md` in this repo.

## Architecture overview

At a high level:

- `packages/mcp-core` defines the `Ctx` object and port interfaces (`DbPort`, `StoragePort`, `EmbeddingPort`) and contains core server flows (e.g., `saveTextResource`, snapshots).
- Concrete adapters live in `packages/mcp-db` (Prisma) and `packages/mcp-storage` (S3/MinIO). Adapters are created with factory functions (for example `makeDb`, `makeS3Storage`).
- Apps under `apps/` wire those ports into running processes (CLI, WebSocket server, docs site).

This decoupled design makes it straightforward to swap out implementations (for example, replacing the noop embeddings with a real vector database client).

## Development workflow

- Build & test across the monorepo using Turbo (see `bunx turbo` commands in CI):

```pwsh
bunx turbo run build
bunx turbo run typecheck
bunx turbo run lint
```

- Run a single package or app with Bun via `bun run <path-to-script>`.

## Project structure

- `apps/` — example applications and docs site
	- `mcp-server-cli/` — CLI example
	- `mcp-server-ws/` — WebSocket server
	- `docs/` — documentation site source
- `packages/` — core packages
	- `mcp-core/` — interfaces, types, and core flows
	- `mcp-db/` — Prisma-backed DbPort
	- `mcp-storage/` — S3 storage + embeddings placeholder
	- `mcp-analysis/` — analysis helpers
	- `shared-config/` — shared ESLint, TS configs, and helpers
- `infra/` — docker-compose and local infra (MinIO, Postgres, qdrant etc.)

See `PACKAGE_OVERVIEW.md` for a package-by-package explanation.

## Contributing

Please read `CONTRIBUTING.md` for contributor onboarding, branch and PR conventions, testing expectations, and how to report issues.

## Technology stack

- Runtime: Bun
- Language: TypeScript
- Database: PostgreSQL (Prisma)
- Blob storage: S3-compatible (MinIO for local dev)
- Embeddings: pluggable (noop by default) — integrate Qdrant/PGVector/other providers
- Monorepo tooling: Turbo

## Docs and references

- Developer guide: `DEVELOPER_GUIDE.md`
- API reference: `API_REFERENCE.md`
- Architecture deep-dive: `ARCHITECTURE.md`
- Troubleshooting: `TROUBLESHOOTING.md`
- Package overview: `PACKAGE_OVERVIEW.md`
- Deployment guide: `DEPLOYMENT.md`
- Examples: `EXAMPLES.md`

If you'd like me to expand any section into a dedicated page under `apps/docs/`, tell me which area and I'll implement it.

This project was created using `bun init` in bun v1.1.12. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
