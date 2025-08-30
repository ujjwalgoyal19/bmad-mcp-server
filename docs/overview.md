# BMAD-MCP Overview

> 🌟 **Welcome to BMAD-MCP!** This guide is designed to help beginners understand what BMAD-MCP is and how it can help you build AI-powered applications.

## What is BMAD-MCP?

BMAD-MCP is an implementation of the Model Context Protocol (MCP), a standardized communication protocol designed to facilitate interaction between AI models and external systems. Think of it as a universal translator that helps AI models talk to other software systems in a consistent, reliable way.

### 🔍 In Simple Terms

Imagine you're trying to connect different AI models (like ChatGPT, Claude, or custom models) to various applications (like a chat interface, a document editor, or a code assistant). Without a standard protocol, you'd need to write custom code for each combination of model and application. BMAD-MCP solves this problem by providing:

- A common language for all AI models to communicate with applications
- A structured way to send requests to models and receive their responses
- A framework for extending AI capabilities through tools and context

### 📊 Visual Overview

```
┌─────────────┐      ┌───────────────┐      ┌─────────────┐
│             │      │  BMAD-MCP     │      │             │
│  Your       │◄────►│  (Protocol    │◄────►│  AI Model   │
│  Application│      │   Server)     │      │             │
└─────────────┘      └───────────────┘      └─────────────┘
                            ▲
                            │
                     ┌──────┴──────┐
                     │   Tools &   │
                     │   Context   │
                     └─────────────┘
```

## Key Concepts

### Model Context Protocol

The Model Context Protocol (MCP) defines a standardized way for AI models to communicate with their environment. It uses JSON-RPC as the underlying message format, providing a clear structure for requests, responses, and notifications.

#### 🧩 Why We Need MCP

Without a standard protocol:

- Each AI model might use a different format for messages
- Applications would need custom code for each model they want to use
- Adding new capabilities would require changes in multiple places

With MCP:

- One consistent way to communicate with any compatible AI model
- Easily swap different models without changing your application code
- Add new capabilities (like tools) that work across all models

#### 🔄 How MCP Works

MCP works by defining standard message types and flows:

1. Your application sends a request to the MCP server
2. The server processes the request and forwards it to the AI model
3. The model generates a response and sends it back through the server
4. The server delivers the response to your application

### JSON-RPC

JSON-RPC is a lightweight remote procedure call protocol that uses JSON for data encoding. In BMAD-MCP, JSON-RPC is used to structure all communication between the server and clients.

#### 📝 What is JSON-RPC?

JSON-RPC is like an envelope for messages. Each message is formatted as a JSON object with specific fields that tell the receiver what to do with it. It's simple but powerful, allowing for structured communication over various transport methods.

#### 📦 Message Types

The protocol supports three main types of messages:

- **Requests**: Messages that expect a response

  ```json
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "model.generate",
    "params": { "prompt": "Tell me a joke about programming" }
  }
  ```

- **Responses**: Replies to requests, containing either results or errors

  ```json
  {
    "jsonrpc": "2.0",
    "id": 1,
    "result": { "text": "Why do programmers prefer dark mode? Because light attracts bugs!" }
  }
  ```

- **Notifications**: One-way messages that don't expect a response

  ```json
  {
    "jsonrpc": "2.0",
    "method": "log.info",
    "params": { "message": "User connected" }
  }
  ```

#### 🔄 Example Flow

Here's a simple example of how JSON-RPC messages flow in BMAD-MCP:

```
Application                    MCP Server                    AI Model
    │                              │                             │
    │  Request: "Generate text"    │                             │
    │─────────────────────────────>│                             │
    │                              │  Forward request            │
    │                              │────────────────────────────>│
    │                              │                             │
    │                              │  Response: Generated text   │
    │                              │<────────────────────────────│
    │  Response: Generated text    │                             │
    │<─────────────────────────────│                             │
    │                              │                             │
```

### Server and Transport

The BMAD-MCP implementation consists of two main components that work together to process messages and communicate with applications and AI models.

#### 🖥️ MCP Server

The MCP Server is the brain of the system. It:

- **Receives messages**: Accepts incoming JSON-RPC messages from clients
- **Routes requests**: Determines which handler should process each request
- **Executes handlers**: Runs the appropriate code to fulfill requests
- **Sends responses**: Returns results back to the client
- **Manages state**: Keeps track of ongoing conversations and context

##### How the Server Works

When a message arrives, the server:

1. Validates that it's a proper JSON-RPC message
2. Checks if it's a request, response, or notification
3. For requests, finds the right handler based on the method name
4. Executes the handler with the provided parameters
5. Creates and sends a response (for requests) or processes silently (for notifications)

##### Example Server Setup

```typescript
// Create a transport and MCP server
import { McpServer, MemoryTransport } from "@bmad/server-core";

const transport = new MemoryTransport();
const server = new McpServer(transport, {
  name: "example-server",
  version: "0.1.0"
});

// Register a handler for 'echo'
server.on("echo", async (params) => {
  return params;
});

// Start the server
await server.start();
```

#### 🔌 Transport Layer

The Transport Layer is like the postal service for messages. It:

- **Abstracts communication**: Hides the details of how messages are sent and received
- **Supports different protocols**: Works with various communication methods (WebSockets, HTTP, in-memory)
- **Handles serialization**: Converts messages to and from JSON strings
- **Manages connections**: Establishes and maintains connections with clients

##### Why Transport Abstraction Matters

By separating the transport layer from the server logic:

- You can switch between different communication methods without changing your server code
- You can use the same server with multiple transport types simultaneously
- Testing becomes easier with in-memory transport that doesn't require network connections

##### Example Transport Usage

```typescript
// Create an in-memory transport for testing
import { McpServer, MemoryTransport } from "@bmad/server-core";

const transport = new MemoryTransport();

// Create a server with the transport and register handlers
const server = new McpServer(transport, {
  name: "example-server",
  version: "0.1.0"
});

server.on("echo", async (params) => {
  return params;
});

// Start the server with the transport
await server.start();

// Later, you can send a test message
transport.receive({
  jsonrpc: "2.0",
  id: 1,
  method: "echo",
  params: { message: "Hello, world!" }
});
```

## Project Structure

### 📁 Monorepo Organization

BMAD-MCP is organized as a monorepo (a single repository containing multiple related packages). This structure makes it easier to manage dependencies between components and ensure they work well together.

```
bmad-mcp/
├── packages/
│   ├── core-protocol/
│   ├── server-core/
│   ├── agent-registry/
│   ├── context-manager/
│   ├── host/
│   ├── mcp-client/
│   ├── security-manager/
│   └── demo/
└── docs/
    ├── overview.md
    ├── getting-started.md
    └── ...
```

### 📦 Package Descriptions

Each package in the monorepo has a specific role in the BMAD-MCP ecosystem:

#### core-protocol

This package is the foundation of BMAD-MCP. It defines:

- JSON-RPC message schemas (what valid messages look like)
- Utility functions for creating and validating messages
- Type definitions for requests, responses, and notifications

**Example**: Creating a standard JSON-RPC request

```typescript
import { makeRequest } from '@bmad/core-protocol';
 
const request = makeRequest('model.generate', {
  prompt: 'Write a poem about programming'
});
 
// Result:
// {
//   jsonrpc: '2.0',
//   id: '<auto-generated id>',
//   method: 'model.generate',
//   params: { prompt: 'Write a poem about programming' }
// }
```

#### server-core

This package implements the core MCP server functionality. It provides:

- The `McpServer` class for handling JSON-RPC messages
- The `Transport` interface for different communication methods
- A built-in `MemoryTransport` implementation for testing

**Example**: Creating a simple MCP server

```typescript
import { McpServer, MemoryTransport } from '@bmad/server-core';
 
const transport = new MemoryTransport();
const server = new McpServer(transport, { name: "example-server", version: "1.0.0" });
 
server.on('hello', async () => {
  return { message: 'Hello, world!' };
});
 
await server.start();
```

#### agent-registry

This package manages the registration and discovery of AI agents. It:

- Keeps track of available agents and their capabilities
- Allows clients to discover which agents can handle specific tasks
- Provides a way to register new agents with the system

#### context-manager

This package handles the context that AI models need to generate responses. It:

- Manages conversation history
- Stores and retrieves relevant information for the model
- Provides context windowing and summarization

#### host

This package provides hosting capabilities for MCP servers. It:

- Sets up the environment for running MCP servers
- Manages server lifecycle (startup, shutdown)
- Configures servers with appropriate settings

#### mcp-client

This package is a client library for connecting to MCP servers. It:

- Provides an easy-to-use API for sending requests to MCP servers
- Handles message formatting and transport details
- Manages request/response correlation

**Example**: Using the MCP client

```typescript
import { McpClient } from '@bmad/mcp-client';
 
// Create a client connected to a server
const client = new McpClient('ws://localhost:8080');
 
// Send a request and get a response
const response = await client.request('model.generate', {
  prompt: 'Tell me a joke'
});
 
console.log(response.result?.text);
```

#### security-manager

This package implements security features for MCP. It:

- Handles authentication and authorization
- Implements rate limiting and quota management
- Provides audit logging for security events

#### demo

This package contains example implementations of MCP servers. It:

- Shows how to set up and configure an MCP server
- Demonstrates different types of handlers
- Provides a working example you can run and experiment with

## Use Cases

### 🚀 Real-World Applications

BMAD-MCP can be used in various scenarios, including:

#### 1. Building AI-Powered Applications

Create applications that leverage AI models for various tasks:

- **Chat Applications**: Build chat interfaces that communicate with AI models
- **Content Generation Tools**: Create tools for generating text, images, or code
- **AI Assistants**: Develop personal or domain-specific assistants

**Example**: A writing assistant application

```typescript
// Create an MCP server for a writing assistant
const transport = new MemoryTransport();
const writingAssistant = new McpServer(transport, { name: "writing-assistant" });
 
writingAssistant.on('text.improve', async ({ text, style }) => {
  const improvedText = await aiModel.improve(text, style);
  return { improvedText };
});
 
writingAssistant.on('text.summarize', async ({ text, length }) => {
  const summary = await aiModel.summarize(text, length);
  return { summary };
});
```

#### 2. Creating Agent Frameworks

Build systems that coordinate multiple AI agents working together:

- **Multi-Agent Systems**: Coordinate specialized agents for complex tasks
- **Agent Collaboration**: Enable agents to communicate and share information
- **Hierarchical Agents**: Create supervisor agents that delegate to specialized agents

#### 3. Implementing Tool-Using Capabilities

Extend AI models with the ability to use external tools:

- **Web Search**: Allow models to search the internet for information
- **Code Execution**: Enable models to run code and get results
- **Database Access**: Let models query and update databases

**Example**: Adding a calculator tool

```typescript
// Add a calculator tool to an MCP server
server.on('tool.calculate', async ({ expression }) => {
  try {
    // Safely evaluate the mathematical expression
    const result = evaluateMathExpression(expression);
    return { result };
  } catch (error) {
    return { error: error.message };
  }
});
```

#### 4. Standardizing Communication

Create a consistent interface between different components of AI systems:

- **Frontend-Backend Communication**: Standardize how UIs talk to AI backends
- **Model Switching**: Easily swap different AI models without changing application code
- **Service Integration**: Connect AI capabilities with other services in your stack

### 💡 Example Projects You Could Build

1. **Smart Document Editor**: An editor that suggests improvements, generates content, and answers questions about your document
2. **AI Development Assistant**: A coding assistant that helps write, explain, and debug code
3. **Research Agent**: A system that can search, summarize, and synthesize information from multiple sources
4. **Customer Support Bot**: An assistant that can answer questions, troubleshoot issues, and escalate to humans when needed

## Next Steps

Now that you understand what BMAD-MCP is and how it works, here are some next steps to get started:

### 📚 Learn More

- Read the [Getting Started](./getting-started.md) guide to set up and run BMAD-MCP
- Explore the [Architecture](./architecture.md) documentation to understand the system design
- Check the [API Reference](./api-reference.md) for detailed information about available methods
- Learn about the [Transport Layer](./transport.md) to understand communication options

### 🛠️ Try It Out

1. **Run the Demo**: Follow the instructions in the Getting Started guide to run the demo server
2. **Experiment**: Try modifying the demo to add your own handlers
3. **Build a Simple App**: Create a basic application that uses BMAD-MCP

### 🤝 Get Involved

- Check out the [Contributing Guide](./contributing.md) to learn how to contribute to the project
- Review the [Release Notes](./release-notes.md) to see what's new and what's coming
- Join the community discussions and share your ideas

### 🔍 Need Help?

If you get stuck or have questions:

- Check the documentation for answers
- Look for similar issues in the project repository
- Reach out to the community for assistance
