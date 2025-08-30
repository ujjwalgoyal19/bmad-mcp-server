# BMAD-MCP Architecture

> 👋 Welcome to the BMAD-MCP Architecture guide! This document will help you understand how the system is designed and how all the pieces fit together.

## System Overview

### 🏗️ What is the BMAD-MCP Architecture?

BMAD-MCP is designed with a **modular architecture** that separates concerns and allows for flexibility in implementation. Think of it like building blocks that can be assembled in different ways to create custom solutions.

### 🧩 Key Architectural Principles

1. **Separation of Concerns**: Each component has a specific responsibility
2. **Modularity**: Components can be replaced or extended without affecting the entire system
3. **Protocol-Based Communication**: Standardized communication using JSON-RPC
4. **Extensibility**: Easy to add new capabilities through custom handlers

### 🔄 The Big Picture

At its core, BMAD-MCP is built around the **Model Context Protocol (MCP)**, which defines how AI models communicate with their environment. This protocol enables AI models to:

- Request information from external sources
- Invoke tools and services
- Receive structured responses
- Maintain context across interactions

```
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│   AI Model or   │◄────►│   MCP Server    │◄────┐
│     Client      │      │                 │     │
│                 │      │                 │     │
└─────────────────┘      └─────────────────┘     │
                                │                │
                                ▼                │
                         ┌─────────────────┐    │
                         │                 │    │
                         │    Handlers     │    │
                         │  (Tools/APIs)   │    │
                         │                 │    │
                         └─────────────────┘    │
                                │                │
                                ▼                │
                         ┌─────────────────┐    │
                         │                 │    │
                         │  External Data  │────┘
                         │   & Services    │
                         │                 │
                         └─────────────────┘
```

### 💡 Real-World Analogy

You can think of BMAD-MCP like a universal translator and coordinator between an AI assistant and various tools:

- The **AI Model** is like a helpful assistant who needs to access different tools
- The **MCP Server** is like a universal remote control that knows how to operate all the tools
- The **Handlers** are like the buttons on the remote, each performing a specific function
- The **Transport Layer** is like the infrared signal that carries commands between the remote and the devices

## Core Components

### 🧠 McpServer

The `McpServer` class is the central component of the system - think of it as the "brain" of the operation.

#### What Does McpServer Do?

- **Message Processing**: Receives and handles incoming JSON-RPC messages
- **Request Routing**: Directs requests to the appropriate handlers (like a traffic controller)
- **Lifecycle Management**: Controls starting and stopping the server
- **Handler Registration**: Provides a way to register custom functionality

#### How It Works

When a client sends a request:

1. The transport layer delivers the message to the McpServer
2. McpServer validates the message format
3. It looks up the appropriate handler for the requested method
4. It calls the handler with the provided parameters
5. It formats the handler's response as a JSON-RPC response
6. It sends the response back through the transport layer

#### Code Example

```typescript
// Creating a basic MCP server
const transport = new MemoryTransport();
const server = new McpServer(transport, {
  name: "example-server",
  version: "1.0.0"
});

// Registering a handler for a specific method
server.on("getWeather", async (params) => {
  const { location } = params;
  // Fetch weather data for the location
  return { temperature: 72, condition: "sunny" };
});

// Starting the server
await server.start();
```

#### Visual Representation

```
┌────────────────────┐      ┌────────────────────┐
│                    │      │                    │
│     McpServer      │◄────►│     Transport      │
│                    │      │                    │
└────────────────────┘      └────────────────────┘
          │                            ▲
          ▼                            │
┌────────────────────┐                 │
│                    │                 │
│      Handlers      │                 │
│                    │                 │
└────────────────────┘                 │
                                       │
                               ┌────────────────────┐
                               │                    │
                               │      Clients       │
                               │                    │
                               └────────────────────┘
```

### 🚌 Transport Layer

The Transport layer is like a communication bus between the server and clients.

#### What Does the Transport Layer Do?

- **Abstraction**: Provides a common interface regardless of the underlying communication method
- **Message Handling**: Serializes and deserializes JSON-RPC messages
- **Connection Management**: Handles the lifecycle of connections

#### Types of Transports

- **MemoryTransport**: For in-process communication (great for testing)
- **WebSocketTransport**: For real-time communication over the web
- **HttpTransport**: For request-response communication over HTTP
- **Custom Transports**: You can implement your own transport for specific needs

#### Code Example

```typescript
// Using the built-in MemoryTransport
const memoryTransport = new MemoryTransport();

// A simplified example of what a WebSocket transport might look like
class WebSocketTransport implements Transport {
  private wss: WebSocketServer;
  private onMessageCallback: (message: JsonRpcRequest) => void;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
  }

  async start(): Promise<void> {
    this.wss.on('connection', (ws) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        this.onMessageCallback(message);
      });
    });
  }

  // Other methods implementation...
}
```

### 📋 Core Protocol

The Core Protocol is the language that the server and clients use to communicate.

#### What Does the Core Protocol Define?

- **Message Formats**: Structures for requests, responses, and notifications
- **Error Handling**: Standard error codes and formats
- **Validation**: Rules for valid messages

#### JSON-RPC Message Examples

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": "request-123",
  "method": "getWeather",
  "params": { "location": "New York" }
}
```

**Successful Response:**
```json
{
  "jsonrpc": "2.0",
  "id": "request-123",
  "result": { "temperature": 72, "condition": "sunny" }
}
```

**Error Response:**
```json
{
  "jsonrpc": "2.0",
  "id": "request-123",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": "Location must be a string"
  }
}
```

#### Why Use JSON-RPC?

- **Standardized**: Based on a well-established protocol
- **Lightweight**: Simple JSON format that's easy to parse
- **Flexible**: Supports both request-response and notification patterns
- **Language-Agnostic**: Can be implemented in any programming language

## Package Architecture

### 📦 Monorepo Structure

BMAD-MCP is organized as a **monorepo** (a single repository containing multiple related packages). This approach makes it easier to manage dependencies and ensure compatibility between components.

#### Visual Package Structure

```
bmad-mcp/
├── packages/
│   ├── server-core/        # Core server implementation
│   ├── core-protocol/      # JSON-RPC protocol definitions
│   ├── agent-registry/     # Agent management
│   ├── context-manager/    # Context handling
│   ├── host/               # Server hosting
│   ├── mcp-client/         # Client library
│   ├── security-manager/   # Security features
│   └── demo/               # Example implementation
├── docs/                   # Documentation
└── scripts/                # Build and utility scripts
```

### 🧰 Package Descriptions

#### server-core

**What it does**: Implements the core MCP server functionality and transport interfaces.

**Key components**:
- `McpServer` class
- `Transport` interface
- `MemoryTransport` implementation

**Example usage**:
```typescript
import { McpServer, MemoryTransport } from "@bmad/server-core";

const transport = new MemoryTransport();
const server = new McpServer(transport, { name: "my-server", version: "1.0.0" });
```

#### core-protocol

**What it does**: Defines the JSON-RPC message schemas and utilities used by both server and client implementations.

**Key components**:
- JSON-RPC request and response types
- Error handling utilities
- Message validation functions

**Example usage**:
```typescript
import { makeResult, makeError, isNotification } from "@bmad/core-protocol";

// Create a successful response
const response = makeResult("request-123", { data: "some result" });

// Check if a request is a notification (no response needed)
if (isNotification(request)) {
  // Handle notification
}
```

#### agent-registry

**What it does**: Manages agent registrations and capabilities, allowing the system to track available agents and their features.

**Key components**:
- Agent registration mechanisms
- Capability discovery
- Agent lookup services

**Real-world analogy**: Think of this as a phone book for AI agents, keeping track of which agents are available and what they can do.

#### context-manager

**What it does**: Handles context management for AI models, providing a way to store and retrieve context information.

**Key components**:
- Context storage
- Context retrieval
- Context update mechanisms

**Real-world analogy**: This is like a memory system for AI models, helping them remember important information between interactions.

#### host

**What it does**: Provides hosting capabilities for MCP servers, including configuration and lifecycle management.

**Key components**:
- Server configuration
- Lifecycle management
- Environment integration

**Real-world analogy**: Think of this as the infrastructure that keeps your MCP servers running, similar to how a web hosting service keeps websites online.

#### mcp-client

**What it does**: Client library for connecting to MCP servers, making it easy to build applications that communicate with MCP servers.

**Key components**:
- Client connection management
- Request/response handling
- Error handling

**Example usage**:
```typescript
import { McpClient } from "@bmad/mcp-client";

const client = new McpClient("ws://localhost:3000");
const result = await client.call("getWeather", { location: "New York" });
console.log(result); // { temperature: 72, condition: "sunny" }
```

#### security-manager

**What it does**: Implements security features for MCP, including authentication, authorization, and secure communication.

**Key components**:
- Authentication mechanisms
- Authorization rules
- Secure communication channels

**Real-world analogy**: This is like the security system for your MCP infrastructure, ensuring that only authorized users and systems can access your servers.

#### demo

**What it does**: Example implementation of an MCP server, demonstrating how to use the various components together.

**Key components**:
- Complete working example
- Best practices demonstration
- Testing utilities

**Real-world analogy**: Think of this as a model home that shows you how all the pieces fit together in a real-world application.

## Message Flow

### 🔄 How Messages Travel Through the System

Let's follow a message from start to finish to understand how BMAD-MCP processes requests:

#### Visual Flow Diagram

```
┌─────────┐     ┌─────────────┐     ┌────────────┐     ┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌─────────┐
│         │     │             │     │            │     │         │     │            │     │             │     │         │
│ Client  │────►│  Transport  │────►│  McpServer │────►│ Handler │────►│ McpServer  │────►│  Transport  │────►│ Client  │
│         │     │             │     │            │     │         │     │            │     │             │     │         │
└─────────┘     └─────────────┘     └────────────┘     └─────────┘     └────────────┘     └─────────────┘     └─────────┘
     │                 ▲                   │                 │                 │                 ▲                 ▲
     │                 │                   │                 │                 │                 │                 │
     │                 │                   ▼                 │                 ▼                 │                 │
     │                 │            ┌────────────┐          │          ┌────────────┐           │                 │
     │                 │            │            │          │          │            │           │                 │
     │                 │            │ Validation │          │          │ Formatting │           │                 │
     │                 │            │            │          │          │            │           │                 │
     │                 │            └────────────┘          │          └────────────┘           │                 │
     │                 │                                     │                                   │                 │
     ▼                 │                                     ▼                                   │                 │
┌─────────────┐        │                              ┌────────────┐                             │          ┌─────────────┐
│             │        │                              │            │                             │          │             │
│   Request   │        └──────────────────────────────│  Response  │─────────────────────────────┘          │   Result    │
│             │                                       │            │                                        │             │
└─────────────┘                                       └────────────┘                                        └─────────────┘
```

#### Step-by-Step Explanation

1. **Client Initiates**: A client creates a JSON-RPC request and sends it to the server via the transport layer
   ```json
   { "jsonrpc": "2.0", "id": "123", "method": "getWeather", "params": { "location": "New York" } }
   ```

2. **Transport Receives**: The transport layer receives the message and passes it to the McpServer

3. **Server Validates**: The server validates the message structure to ensure it's a valid JSON-RPC request

4. **Server Routes**: If valid, the server looks up and calls the appropriate handler for the requested method
   ```typescript
   // Inside McpServer
   const handler = this.handlers.get(request.method);
   if (handler) {
     const result = await handler(request.params);
     // ...
   }
   ```

5. **Handler Processes**: The handler executes the requested operation and returns a result or throws an error
   ```typescript
   // Example handler
   function getWeatherHandler(params) {
     const { location } = params;
     // Fetch weather data...
     return { temperature: 72, condition: "sunny" };
   }
   ```

6. **Server Formats Response**: The server formats the handler's result as a JSON-RPC response
   ```json
   { "jsonrpc": "2.0", "id": "123", "result": { "temperature": 72, "condition": "sunny" } }
   ```

7. **Transport Sends**: The transport layer sends the response back to the client

### 💡 Real-World Analogy

This process is similar to ordering food at a restaurant:

1. You (the client) place an order (request) with the waiter (transport)
2. The waiter takes your order to the kitchen (server)
3. The chef (handler) prepares your meal
4. The waiter brings your food (response) back to your table

## Extension Points

### 🔌 Making BMAD-MCP Your Own

BMAD-MCP is designed to be highly extensible, allowing you to customize it for your specific needs. Here are the main ways you can extend the system:

### Custom Handlers

**What**: Add your own functionality to the MCP server by registering custom handlers for specific methods.

**How**: Use the `on` method of the `McpServer` class to register a function that will be called when a specific method is requested.

**Example**:
```typescript
// Register a handler for the "translateText" method
server.on("translateText", async (params) => {
  const { text, targetLanguage } = params;
  // Implement translation logic here
  const translatedText = await translateService.translate(text, targetLanguage);
  return { translatedText };
});
```

### Custom Transports

**What**: Create your own transport mechanisms to support different communication channels.

**How**: Implement the `Transport` interface with your own class that handles the specific communication channel you need.

**Example**:
```typescript
class HttpTransport implements Transport {
  private server: http.Server;
  private onMessageCallback: (message: JsonRpcRequest) => void;

  constructor(port: number) {
    this.server = http.createServer((req, res) => {
      // Handle HTTP requests
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        const message = JSON.parse(body);
        // Process the message and send response
        // ...
      });
    });
  }

  // Implement other Transport methods
  // ...
}
```

### Middleware

**What**: Add cross-cutting functionality that applies to all requests, such as logging, authentication, or rate limiting.

**How**: While not explicitly implemented in the current version, you can achieve middleware-like functionality by chaining handlers or wrapping the dispatch method.

**Example**:
```typescript
// Create a wrapper for handlers that adds logging
function withLogging(handler) {
  return async (params) => {
    console.log(`Handler called with params:`, params);
    const result = await handler(params);
    console.log(`Handler returned result:`, result);
    return result;
  };
}

// Register a handler with logging
server.on("getWeather", withLogging(async (params) => {
  // Handler implementation
  return { temperature: 72 };
}));
```

## Security Considerations

### 🔒 Keeping Your MCP Server Safe

Security is a critical aspect of any system that communicates over networks. BMAD-MCP includes a security-manager package that provides various security features:

#### Authentication

**What**: Verifying the identity of clients connecting to your MCP server.

**How**: The security-manager can implement various authentication mechanisms:
- API keys
- JWT tokens
- OAuth flows
- Custom authentication schemes

**Example**:
```typescript
// Example of JWT authentication (conceptual)
import { createSecurityMiddleware } from "@bmad/security-manager";

const securityMiddleware = createSecurityMiddleware({
  authentication: {
    type: "jwt",
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"]
  }
});

// Apply middleware to server
server.use(securityMiddleware);
```

#### Authorization

**What**: Determining what authenticated clients are allowed to do.

**How**: Define permission rules based on client identity and requested methods.

**Example**:
```typescript
// Example of method-based authorization (conceptual)
const authorizationRules = {
  "getPublicData": ["anonymous", "user", "admin"],
  "updateUserProfile": ["user", "admin"],
  "deleteUser": ["admin"]
};

// Apply rules to server
server.setAuthorizationRules(authorizationRules);
```

#### Secure Communication

**What**: Ensuring that data transmitted between clients and the server cannot be intercepted or tampered with.

**How**: Use encrypted transport protocols like HTTPS or WSS (WebSockets Secure).

#### Input Validation

**What**: Checking that incoming data conforms to expected formats and constraints.

**How**: Validate all input parameters before processing them in handlers.

**Example**:
```typescript
import { z } from "zod"; // Schema validation library

// Define a schema for the getWeather method parameters
const getWeatherSchema = z.object({
  location: z.string().min(1).max(100),
  units: z.enum(["metric", "imperial"]).optional().default("metric")
});

// Register a handler with validation
server.on("getWeather", async (params) => {
  // Validate parameters against schema
  const validParams = getWeatherSchema.parse(params);
  
  // Now use the validated parameters
  return getWeatherData(validParams.location, validParams.units);
});
```

### Security Best Practices

1. **Keep dependencies updated** to patch known vulnerabilities
2. **Use environment variables** for sensitive configuration
3. **Implement rate limiting** to prevent abuse
4. **Log security events** for monitoring and auditing
5. **Apply the principle of least privilege** when designing your API

## Next Steps

### 🚀 Continue Your Learning Journey

Now that you understand the architecture of BMAD-MCP, here are some resources to help you dive deeper:

- [**API Reference**](./api-reference.md): Detailed documentation of all available methods and classes
- [**Transport Layer**](./transport.md): Learn more about different transport options and how to implement your own
- [**Getting Started**](./getting-started.md): Step-by-step guide to building your first MCP server
- [**Contributing**](./contributing.md): Guidelines for contributing to the BMAD-MCP project

### Ready to Build?

With this architectural understanding, you're now equipped to start building your own MCP servers and clients. Remember that the architecture is designed to be flexible, so feel free to adapt it to your specific needs while following the core principles.