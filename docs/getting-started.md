# Getting Started with BMAD-MCP

> 🚀 **Welcome to BMAD-MCP!** This guide will walk you through setting up and running your first MCP server, even if you're new to the project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - The JavaScript runtime that powers BMAD-MCP
- **npm** (v8 or later) - The Node.js package manager used to install dependencies

### 🔍 How to Check Your Versions

Not sure which versions you have? Run these commands in your terminal:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

### 📥 Installing Node.js and npm

If you need to install or update Node.js and npm:

1. Visit the [official Node.js website](https://nodejs.org/)
2. Download the LTS (Long Term Support) version
3. Follow the installation instructions for your operating system
4. npm comes bundled with Node.js, so you'll get both

## Installation

### 📋 Step-by-Step Guide

1. **Clone the repository**:
   
   First, you'll need to download the BMAD-MCP code to your computer. Open your terminal and run:

   ```bash
   git clone https://github.com/yourusername/bmad-mcp.git
   cd bmad-mcp
   ```

   > 💡 **New to Git?** If you don't have Git installed, you can [download it here](https://git-scm.com/downloads) or alternatively download the project as a ZIP file from the GitHub repository.

2. **Install dependencies**:
   
   Next, you'll need to install all the packages that BMAD-MCP depends on. This might take a minute or two:

   ```bash
   npm install
   ```

   > 🔍 **What's happening?** This command reads the `package.json` file and installs all the libraries and tools that BMAD-MCP needs to work properly.

3. **Build the project**:
   
   Now, let's compile the TypeScript code into JavaScript that can be executed:

   ```bash
   npm run build
   ```

   > 🔧 **What's happening?** This command compiles all the TypeScript files in the project into JavaScript files that Node.js can run. It also checks for type errors and other issues.

### ✅ Verifying Installation

To make sure everything is set up correctly, you should see:

- No error messages during the build process
- A new `dist` folder in each package directory containing compiled JavaScript files

## Running the Demo

### 🎮 Try It Out

BMAD-MCP includes a demo application that demonstrates basic functionality. This is a great way to see the protocol in action!

```bash
npm run dev:demo
```

> 🔍 **What's happening?** This command starts a simple MCP server using an in-memory transport and processes an initialization request. You'll see JSON-RPC messages being exchanged in your terminal.

### 📊 Expected Output

When you run the demo, you should see output similar to this:

```
Starting MCP demo...
Sending initialize request...
Received response: {
  "jsonrpc": "2.0",
  "id": "...",
  "result": {
    "protocolVersion": "0.1.0",
    "capabilities": { ... },
    "serverInfo": { "name": "demo-server", "version": "0.1.0" }
  }
}
Demo completed successfully!
```

### 🔄 What Just Happened?

1. The demo created an MCP server with an in-memory transport
2. It sent an initialization request to the server
3. The server processed the request and sent back a response
4. The demo displayed the response and completed

## Project Structure

### 📁 Understanding the Monorepo

The project is organized as a monorepo with multiple packages. This structure allows each component to be developed and tested independently while still working together seamlessly.

```
bmad-mcp/
├── packages/              # All project packages live here
│   ├── agent-registry/    # Manages agent registrations and capabilities
│   ├── context-manager/   # Handles context management for AI models
│   ├── core-protocol/     # Defines JSON-RPC message schemas and utilities
│   ├── demo/              # Example implementation of an MCP server
│   ├── host/              # Provides hosting capabilities for MCP servers
│   ├── mcp-client/        # Client library for connecting to MCP servers
│   ├── security-manager/  # Implements security features for MCP
│   └── server-core/       # Core MCP server implementation
├── docs/                  # Documentation files
├── package.json           # Root package configuration
└── tsconfig.json         # TypeScript configuration
```

### 🧩 Key Packages

When you're getting started, these are the most important packages to understand:

- **core-protocol**: The foundation of the system, defining message formats
- **server-core**: The main server implementation you'll use to create MCP servers
- **demo**: Contains examples you can learn from and modify

## Creating Your First MCP Server

### 🛠️ Step-by-Step Tutorial

Let's create a simple MCP server that can echo back messages. This example will help you understand the basic components of an MCP server.

#### 1. Create a New File

Create a new file called `my-server.ts` in the project root or in a location of your choice.

#### 2. Add the Following Code

```typescript
import { McpServer, MemoryTransport } from "@bmad/server-core";

async function main() {
  // Create a transport (in-memory for this example)
  // The transport handles sending and receiving messages
  const transport = new MemoryTransport();
  
  // Create the MCP server with our transport and server info
  const server = new McpServer(transport, {
    name: "my-mcp-server",    // Name of your server
    version: "0.1.0",         // Version of your server
  });

  // Add a custom handler for the 'echo' method
  // This will respond to any 'echo' requests by returning the parameters
  server.on("echo", (params) => {
    console.log("Received echo request with params:", params);
    return { message: params };
  });

  // Start the server
  await server.start();

  console.log("MCP Server started!");
  
  // For testing: Send a message to our server using the in-memory transport
  transport.receive({
    jsonrpc: "2.0",
    id: "test-1",
    method: "echo",
    params: { text: "Hello, MCP!" }
  });
}

// Run the main function
void main();
```

#### 3. Understanding the Code

- **Transport**: We create an in-memory transport for testing. In a real application, you might use WebSockets or HTTP.
- **Server**: We create an MCP server with our transport and some basic information.
- **Handler**: We add a handler for the "echo" method that returns whatever parameters it receives.
- **Start**: We start the server, making it ready to receive messages.
- **Test Message**: We send a test message to our server using the in-memory transport.

#### 4. Running Your Server

To run your server, you'll need to compile and execute it:

```bash
# Compile the TypeScript file
npx tsc my-server.ts

# Run the compiled JavaScript
node my-server.js
```

#### 5. Expected Output

You should see output similar to this:

```
MCP Server started!
Received echo request with params: { text: 'Hello, MCP!' }
```

### 🔄 Extending Your Server

Once you have the basic server working, you can extend it by:

- Adding more handlers for different methods
- Using a different transport (like WebSockets)
- Implementing more complex logic in your handlers

## Running Tests

### 🧪 Testing Your Code

BMAD-MCP comes with a comprehensive test suite to ensure everything works correctly. Running tests is a great way to verify your setup and learn how the system works.

#### Running All Tests

To run the complete test suite:

```bash
npm run test
```

> 🔍 **What's happening?** This command runs all the tests in the project using Vitest, a fast testing framework for JavaScript/TypeScript.

#### Watch Mode for Development

During development, it's helpful to have tests run automatically when you make changes:

```bash
npm run test:watch
```

> 💡 **Tip:** Watch mode is great for test-driven development (TDD). You can write a test, see it fail, implement the feature, and see the test pass, all without manually rerunning the tests.

#### Understanding Test Results

When tests run successfully, you'll see output like this:

```
✓ packages/core-protocol/test/jsonrpc.test.ts (5 tests) 253ms
✓ packages/server-core/test/mcpServer.test.ts (5 tests) 12ms

Test Files  2 passed (2)
     Tests  10 passed (10)
  Start at  10:15:23
  Duration  1.24s (transform 115ms, setup 0ms, collect 152ms, tests 265ms)
```

## Next Steps

### 🚀 Continue Your MCP Journey

Now that you've set up your environment and created your first MCP server, here are some recommended next steps to deepen your understanding:

#### 📚 Explore the Documentation

- [**API Reference**](./api-reference.md): Detailed documentation of all APIs, classes, and methods
  > *Perfect for when you need to understand specific functionality in depth*

- [**Architecture**](./architecture.md): Learn about the system architecture and how all the pieces fit together
  > *Helps you understand the big picture and design principles*

- [**Transport**](./transport.md): Explore different transport options for your MCP server
  > *Essential for building real-world applications with different communication needs*

#### 🧩 Try More Advanced Examples

1. **Create a WebSocket Transport**: Implement a server that communicates over WebSockets
2. **Build a Multi-Tool Server**: Create a server that offers multiple tools or capabilities
3. **Integrate with an AI Agent**: Connect your MCP server to an AI agent framework

#### 🤝 Get Involved

- Check out the [Contributing Guide](./contributing.md) to learn how to contribute to the project
- Join discussions in the GitHub repository's Issues and Discussions sections
- Share your projects and experiences with the community

## Conclusion

### 🎉 You're Ready to Build!

Congratulations! You've now set up your development environment, run the demo, and created your first MCP server. You have all the basic knowledge needed to start building with BMAD-MCP.

Remember that the Model Context Protocol is designed to be flexible and extensible. As you become more familiar with it, you'll discover many ways to enhance AI applications by providing them with tools and capabilities through standardized communication.

If you encounter any issues or have questions, don't hesitate to check the documentation or reach out to the community. Happy building!