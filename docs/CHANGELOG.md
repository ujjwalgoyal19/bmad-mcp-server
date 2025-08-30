# Changelog

All notable documentation changes for the BMAD-MCP project.

Date: 2025-08-30

Summary of edits:

- [`docs/api-reference.md`](docs/api-reference.md:1): Fixed import scope from the fictional `@bmad-mcp` to `@bmad/server-core` and updated McpServer examples to match actual API.
- [`docs/overview.md`](docs/overview.md:1): Replaced object-based McpServer({...}) examples with transport-based usage (MemoryTransport) and corrected imports.
- [`docs/transport.md`](docs/transport.md:1): Consolidated MemoryTransport import into `@bmad/server-core`.
- [`docs/getting-started.md`](docs/getting-started.md:1): Verified McpServer(transport, opts) example; no code changes required.
- [`docs/architecture.md`](docs/architecture.md:1): Verified server examples use the transport-based constructor; no changes required.
- [`docs/contributing.md`](docs/contributing.md:1): Expanded setup steps, added Node.js >= 18 requirement, branch/clone workflow, and demo command snippet.
- [`docs/release-notes.md`](docs/release-notes.md:1): Added an "Unreleased" section and pointer to CHANGELOG.md.
- [`docs/README.md`](docs/README.md:1): Added one-line quick start (`npm run dev:demo`) and standardized quick-start steps; placeholders preserved.

Notes:

- Removed all occurrences of the fictional package scope `@bmad-mcp`.
- Standardized McpServer usage to `new McpServer(transport, opts)` and replaced handler registration examples to use `server.on(...)`.
- Placeholders `<REPO_URL>` and `<ISSUES_URL>` remain throughout docs — please replace with actual repository and issue tracker URLs.

Next steps completed:

- Lightweight editorial pass (typos, basic formatting) performed.
- Basic internal link verification performed; no broken internal links detected.

If you want stricter stylistic edits (remove emojis, stricter tone), tell me the preferred style and I will apply it.
