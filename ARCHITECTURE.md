# ARCHITECTURE — BMAD MCP Server

This document explains the high-level architecture and design decisions for the BMAD MCP Server.

## Port-and-adapter

- Core behavior lives in `packages/mcp-core` and depends only on abstract port interfaces defined in `packages/mcp-core/src/ports.ts`.
- Adapters implement those ports (for example `packages/mcp-db` implements `DbPort` using Prisma).
- The `Ctx` dependency injection object carries `{ db, storage, embeddings }` into core flows.

## Data flow example: saveTextResource

- Upsert resource (DB) -> create blob (DB) -> put object (storage) -> set latest blob (DB) -> embeddings.index(...)
- This function is the canonical example of cross-package interactions.

## Storage and embeddings

- Storage is S3-compatible and expects `S3_ENDPOINT`, `S3_BUCKET` and credentials. Local dev uses MinIO in `infra/docker-compose.yml`.
- Embeddings are pluggable; the repo includes a noop implementation. Replace with Qdrant/pgvector clients as needed.

## Real-time and WebSocket

- `apps/mcp-server-ws` wires the core flows with a WebSocket transport for real-time snapshotting and session updates.

## Scalability & security notes

- Keep the `Ctx` surface small and prefer stateless adapters. Use connection pooling for DB.
- Secure S3 credentials and DB URLs in environment/secret manager in production.
