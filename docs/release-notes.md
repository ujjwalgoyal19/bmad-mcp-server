# Release Notes

## Unreleased

- Summary: work in progress. Add entries here as PRs are merged.
- See ./CHANGELOG.md for formatted release history (create if missing).

## Version 1.0.0 (Current)

Initial release of BMAD-MCP with the following features:

### Core Features

- Basic MCP server implementation
- JSON-RPC message handling
- In-memory transport for testing
- Method registration system
- Error handling

### Packages

- **core-protocol**: JSON-RPC message schemas and utilities
- **server-core**: MCP server and transport interfaces
- **agent-registry**: Agent registration and capabilities management
- **context-manager**: Context management for AI models
- **host**: Hosting capabilities for MCP servers
- **mcp-client**: Client library for connecting to MCP servers
- **security-manager**: Security features for MCP
- **demo**: Example implementation of an MCP server

### Known Issues

- Limited transport implementations
- Basic error handling
- Limited documentation

## Future Releases

### Planned for Version 1.1.0

- WebSocket transport implementation
- HTTP transport implementation
- Improved error handling
- Enhanced documentation
- More examples

### Planned for Version 1.2.0

- Authentication and authorization
- Middleware support
- Streaming capabilities
- Performance improvements
- Additional testing
