# API Reference — BMAD MCP Server

This reference documents the primary port interfaces and core types used across the monorepo.

## Ports

- `DbPort` — Prisma-backed database operations (projects, sessions, resources, blobs, snapshots, embeddings). Implemented by `packages/mcp-db`.
- `StoragePort` — S3-compatible storage for blobs. Implementations should return an accessible URL and consistent object keys.
- `EmbeddingPort` — pluggable embeddings/indexing interface. The repo ships a noop implementation in `packages/mcp-storage`.

See `packages/mcp-core/src/ports.ts` for the exact TypeScript type definitions and method signatures.

## Core types

- `Ctx` — dependency injection context containing `{ db, storage, embeddings }`.
- Domain models: `Project`, `Session`, `Resource`, `Blob`, `Snapshot`, `Embedding` — see Prisma schema in `packages/mcp-db/prisma/schema.prisma` for canonical fields.

## Example usage

Wire concrete adapters into `Ctx` using `makeX` factories and call `mcp-core` flows. For example, the CLI entrypoint wires `makeDb`, `makeS3Storage`, and `makeNoopEmbeddings` and then calls server flows like `saveTextResource`.

If you change any exposed port signatures, update `API_REFERENCE.md`, `DEVELOPER_GUIDE.md`, and the docs under `apps/docs/`.
