# BMAD-MCP

BMAD-MCP is an implementation of the Model Context Protocol (MCP), designed to facilitate communication between AI models and external systems.

## Features

- JSON-RPC based communication protocol
- Modular architecture with pluggable transports
- Support for custom method handlers
- Comprehensive error handling
- TypeScript implementation with strong typing

## Installation

```bash
npm install
```

## Quick Start

```typescript
import { McpServer, MemoryTransport } from "@bmad/server-core";

async function main() {
  const transport = new MemoryTransport();
  const server = new McpServer(transport, {
    name: "my-mcp-server",
    version: "0.1.0",
  });

  // Add a custom handler
  server.on("echo", (params) => {
    return { message: params };
  });

  // Start the server
  await server.start();

  console.log("MCP Server started!");
}

void main();
```

## Documentation

Comprehensive documentation is available in the [docs](./docs) directory:

- [Overview](./docs/overview.md)
- [Getting Started](./docs/getting-started.md)
- [Architecture](./docs/architecture.md)
- [API Reference](./docs/api-reference.md)
- [Transport Layer](./docs/transport.md)
- [Contributing](./docs/contributing.md)
- [Release Notes](./docs/release-notes.md)

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

### Running the Demo

```bash
npm run dev:demo
```

## License

This project is licensed under the ISC License.