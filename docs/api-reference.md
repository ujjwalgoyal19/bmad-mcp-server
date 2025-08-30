# BMAD-MCP API Reference

> 🌟 **Welcome to the BMAD-MCP API Reference!** This guide is designed to help beginners understand the core components and functionality of the Model Context Protocol implementation.

## 🎓 How to Use This Guide

This API reference is designed to be beginner-friendly, with explanations, examples, and real-world analogies to help you understand each component. Here's how to get the most out of it:

1. **Start with the basics**: If you're new to BMAD-MCP, begin with the `McpServer` and `Transport Interface` sections
2. **Look for examples**: Each section includes practical code examples to show you how to use the API
3. **Read the analogies**: We've included real-world comparisons to help you understand abstract concepts
4. **Try it yourself**: The best way to learn is by experimenting with the code examples

## 📚 Table of Contents

- [McpServer](#mcpserver) - The core server component that processes requests and responses
- [Transport Interface](#transport-interface) - How messages are sent and received between clients and servers
- [MemoryTransport](#memorytransport) - A simple in-memory transport implementation for testing
- [Handler Type](#handler-type) - How to create functions that process method calls
- [JSON-RPC Types](#json-rpc-types) - Understanding the message format specifications
- [Error Codes](#error-codes) - Standard error codes and what they mean
- [Utility Functions](#utility-functions) - Helper functions to make development easier

## McpServer

> 🏢 **The Heart of Your MCP Application**

The `McpServer` class is the heart of BMAD-MCP. Think of it as a special kind of web server that speaks the Model Context Protocol language. It's the main component you'll use to create your own MCP server.

### 🔍 What Does McpServer Do?

- **Receives messages** from clients (like AI models or applications)
- **Routes these messages** to the right handlers (like a postal service sorting mail)
- **Sends back responses** after processing requests
- **Manages the lifecycle** of your entire MCP application

### 🌍 Real-World Analogy

Imagine `McpServer` as a customer service center:

- Customers (clients) send in requests
- The center routes each request to the right department (handler)
- Specialists in each department handle the specific requests
- The center sends the answers back to the customers

### 📊 Visual Overview

```
┌─────────────┐      ┌───────────────┐      ┌─────────────┐
│             │      │  McpServer    │      │             │
│  Client     │─────►│  (Routes      │─────►│  Handlers   │
│  Requests   │      │   Messages)   │      │             │
└─────────────┘      └───────────────┘      └─────────────┘
                            │                      │
                            │                      │
                            ▼                      ▼
                     ┌─────────────┐        ┌─────────────┐
                     │  Transport  │        │  Responses  │
                     │  Layer      │        │  to Clients │
                     └─────────────┘        └─────────────┘
```

### Constructor

```typescript
constructor(transport: Transport, opts: McpServerOptions)
```

**Parameters explained:**

- `transport`: This is how your server will communicate with the outside world. Think of it like choosing between mail, email, or text messages for communication. You'll need to provide an object that implements the `Transport` interface (explained below).

- `opts`: These are the settings for your server:
  - `name`: A friendly name for your server (e.g., "My First MCP Server")
  - `version`: (Optional) The version of your server (e.g., "1.0.0") - helps with compatibility
  - `protocolVersion`: (Optional) Which version of the MCP protocol to use (defaults to "2024-11-05") - usually you can leave this as the default

**Example: Creating a basic server**

```typescript
import { McpServer, MemoryTransport } from '@bmad/server-core';

// Create a transport (how messages will be sent/received)
const transport = new MemoryTransport();

// Create the server
const server = new McpServer(transport, {
  name: "My First MCP Server",
  version: "1.0.0"
});

// Now you can add handlers and start the server
```

### Methods

#### on

> 🔌 **Connect Your Server to the World**

Registers a handler for a specific method. This is how you tell your server what to do when it receives different types of requests.

```typescript
on(method: string, handler: Handler): void
```

**Parameters explained:**

- `method`: The name of the method that clients will call (like "getWeather" or "translateText")
- `handler`: A function that will run when this method is called. It receives the client's parameters and should return a result (or a Promise that resolves to a result)

**Real-world analogy:** Think of methods like different departments in a company. The `on` method is like setting up a new department and assigning someone to handle requests that come to that department.

**Example with explanation:**

```typescript
// Create a simple echo service that returns whatever is sent to it
server.on("echo", (params) => {
  console.log("Received request with params:", params);
  return { message: params }; // Whatever was sent gets returned
});

// Create a greeting service that says hello to a person
server.on("greet", (params: { name: string }) => {
  const name = params.name || "friend";
  return { greeting: `Hello, ${name}!` };
});

// Create a calculator service that adds two numbers
server.on("calculate.add", (params: { a: number, b: number }) => {
  const result = params.a + params.b;
  return { result };
});
```

**Common patterns for method names:**

- Use dot notation for categorizing related methods: `category.action`
  - Example: `model.generate`, `tool.search`, `user.authenticate`
- Use descriptive verbs that explain what the method does
  - Example: `document.create`, `document.update`, `document.delete`
- Group related functionality under the same prefix
  - Example: `math.add`, `math.subtract`, `math.multiply`

#### start

> 🚀 **Launch Your Server**

Starts the server and begins listening for messages. You must call this method to activate your server.

```typescript
start(): Promise<void>
```

**What happens when you call start():**

1. The transport layer is initialized
2. The server begins listening for incoming messages
3. Your handlers are ready to process requests

**Example:**

```typescript
// Create and start a server
const transport = new MemoryTransport();
const server = new McpServer(transport, { name: "My First Server" });

// Set up handlers
server.on("ping", () => ({ pong: true }));

// Start the server
await server.start();
console.log("Server is running and ready to handle requests!");

// A complete example with error handling
try {
  await server.start();
  console.log("Server started successfully!");
} catch (error) {
  console.error("Failed to start server:", error);
}
```

#### stop

> 🛑 **Gracefully Shut Down Your Server**

Stops the server and cleans up resources. Call this when you're done with the server or when your application is shutting down.

```typescript
stop(): Promise<void>
```

**What happens when you call stop():**

1. The server stops accepting new requests
2. Any in-progress requests are allowed to complete
3. The transport layer is shut down
4. Resources are released

**Example:**

```typescript
// When it's time to shut down
console.log("Shutting down server...");
await server.stop();
console.log("Server has been stopped.");

// A complete example with error handling
try {
  await server.stop();
  console.log("Server stopped successfully!");
} catch (error) {
  console.error("Failed to stop server cleanly:", error);
}
```

**Best practices for server lifecycle management:**

- Always call `start()` before accepting any client connections
- Always call `stop()` when your application is shutting down
- Handle process signals (like SIGINT) to gracefully stop your server
- Add proper error handling around both `start()` and `stop()` calls

## Transport Interface

> 🚚 **The Delivery System for Your Messages**

### What is a Transport?

The `Transport` interface is like a communication channel or delivery service for your MCP server. It defines how messages are sent and received between clients and your server.

**Real-world analogy:** If your MCP server is like a restaurant kitchen, the Transport is like the waitstaff that takes orders from customers and delivers food back to them. Different restaurants might use different systems (in-person waiters, phone orders, or a mobile app), but they all need some way to receive orders and deliver food.

### 📊 Visual Overview

```
┌─────────────┐      ┌───────────────┐      ┌─────────────┐
│             │      │  Transport    │      │             │
│  Client     │◄────►│  (Delivers    │◄────►│  McpServer  │
│             │      │   Messages)   │      │             │
└─────────────┘      └───────────────┘      └─────────────┘
```

### Interface Definition

```typescript
interface Transport {
  start(): Promise<void> | void;
  stop(): Promise<void> | void;
  send(message: JsonRpcMessage): Promise<void> | void;
  onMessage(handler: (message: JsonRpcMessage) => void): void;
}
```

### Transport Types You Might Use

- **MemoryTransport**: For testing or when client and server are in the same process
- **WebSocketTransport**: For real-time, bidirectional communication
- **HttpTransport**: For request/response over HTTP
- **Custom Transports**: You can create your own for specific needs

### Why is Transport separate from the Server?

Separating the transport from the server logic follows a design principle called "separation of concerns." This makes the code:

- **More flexible**: You can switch between different transport types (WebSockets, HTTP, in-memory) without changing your server logic
- **Easier to test**: You can test your server logic without needing a real network connection
- **More maintainable**: Changes to how messages are transported don't require changes to your business logic

**Example: Switching transports without changing server logic**

```typescript
// Create a server with WebSocket transport for production
const productionServer = new McpServer(
  new WebSocketTransport({ port: 8080 }),
  { name: "Production Server" }
);

// Create the same server with Memory transport for testing
const testServer = new McpServer(
  new MemoryTransport(),
  { name: "Test Server" }
);

// Both servers can use the same handlers!
function setupHandlers(server) {
  server.on("echo", (params) => params);
  server.on("add", ({ a, b }) => ({ result: a + b }));
}

setupHandlers(productionServer);
setupHandlers(testServer);
```

### Methods

#### start

> 🚀 **Power Up Your Transport**

Initializes the transport and prepares it to send and receive messages.

```typescript
start(): Promise<void> | void
```

**When to call it:** This is usually called automatically when you start your McpServer. It sets up any connections or resources needed for communication.

**What happens during start():**

1. The transport initializes any required resources (sockets, connections, etc.)
2. It begins listening for incoming messages
3. It prepares to send outgoing messages

**Example (for a hypothetical WebSocket transport):**

```typescript
// Inside a WebSocketTransport implementation
async start() {
  // Create a WebSocket server on port 8080
  this.server = new WebSocketServer({ port: 8080 });
  console.log('WebSocket transport listening on port 8080');
  
  // Set up event handlers for new connections
  this.server.on('connection', (socket) => {
    console.log('New client connected');
    
    // Listen for messages from this client
    socket.on('message', (data) => {
      try {
        // Parse the incoming JSON message
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);
        
        // Pass the message to the handler
        this.messageHandler(message);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    // Handle disconnections
    socket.on('close', () => {
      console.log('Client disconnected');
    });
  });
}
```

#### stop

> 🛑 **Safely Shut Down Your Transport**

Cleans up resources and stops the transport.

```typescript
stop(): Promise<void> | void
```

**When to call it:** This is usually called automatically when you stop your McpServer. It closes connections and frees up resources.

**What happens during stop():**

1. The transport stops accepting new connections
2. It closes any open connections gracefully
3. It releases all resources it was using

**Example (continuing our WebSocket example):**

```typescript
async stop() {
  if (this.server) {
    // Close the WebSocket server gracefully
    await new Promise(resolve => this.server.close(resolve));
    console.log('WebSocket transport stopped');
    
    // Clear any references to the server
    this.server = null;
    this.clients = [];
  }
}
```

#### send

> 📤 **Deliver Messages to Clients**

Sends a JSON-RPC message through the transport.

```typescript
send(message: JsonRpcMessage): Promise<void> | void
```

**When it's called:** This is called by the McpServer whenever it needs to send a message to a client. The transport is responsible for delivering the message to the right destination.

**What happens during send():**

1. The transport serializes the message to a string (if needed)
2. It determines which client(s) should receive the message
3. It delivers the message through the appropriate channel

**Example (continuing our WebSocket example):**

```typescript
async send(message: JsonRpcMessage) {
  // Convert the message object to a JSON string
  const messageString = JSON.stringify(message);
  console.log('Sending message:', message);
  
  // If this is a response, find the client that sent the original request
  if ('id' in message && message.id) {
    const client = this.findClientById(message.id);
    if (client && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(messageString);
      return;
    }
  }
  
  // If it's a notification or we couldn't find the specific client,
  // broadcast to all connected clients
  this.clients.forEach(client => {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(messageString);
    }
  });
}
```

**Parameters explained:**

- `message`: The JSON-RPC message to send to a client. This contains all the information needed for the request or response.

**What it does:** Takes a message and delivers it to the intended recipient. How this happens depends on the specific transport implementation.

**Example:**

```typescript
// Inside a WebSocketTransport implementation
send(message: JsonRpcMessage): void {
  // Convert the message to a string
  const messageString = JSON.stringify(message);
  
  // Send to all connected clients (in a real implementation, you'd target specific clients)
  this.server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
}
```

#### onMessage

> 📥 **Listen for Incoming Messages**

Registers a handler for incoming messages.

```typescript
onMessage(handler: (message: JsonRpcMessage) => void): void
```

**When it's called:** This is typically called by the McpServer during initialization to set up the message handling pipeline.

**What happens during onMessage():**

1. The transport stores the provided handler function
2. When messages arrive, the transport calls this handler with the parsed message
3. The handler (usually part of McpServer) processes the message and determines what to do with it

**Parameters explained:**

- `handler`: A function that will be called whenever a new message arrives. It receives the message as its parameter.

**Example (continuing our WebSocket example):**

```typescript
onMessage(handler: (message: JsonRpcMessage) => void): void {
  // Store the handler function for later use
  this.messageHandler = handler;
  
  console.log('Message handler registered');
  
  // Example of how this handler gets used when a message arrives
  // (this is just for illustration - the actual call happens in the
  // connection event handler we set up in start())
  
  /* 
  // When a message arrives via WebSocket:
  socket.on('message', (data) => {
    try {
      // Parse the raw data into a JSON-RPC message
      const message = JSON.parse(data.toString());
      
      // Call the handler with the parsed message
      this.messageHandler(message);
    } catch (error) {
      console.error('Failed to process message:', error);
    }
  });
  */
}
```

**Common Pitfalls to Avoid:**

- **Not validating messages:** Always validate incoming messages before passing them to the handler
- **Forgetting error handling:** Wrap message processing in try/catch blocks to prevent crashes
- **Losing the handler reference:** Make sure to properly store the handler function for later use

**Example:**

```typescript
// Inside a Transport implementation
onMessage(handler: (message: JsonRpcMessage) => void): void {
  // Store the handler for later use
  this.messageHandler = handler;
  console.log('Message handler registered');
}
```

## MemoryTransport

> 🧠 **The Simplest Transport for Testing and Development**

### What is MemoryTransport?

The `MemoryTransport` is a special implementation of the `Transport` interface that works entirely in memory - no network connections required! It's primarily used for:

- **Testing**: You can test your server without setting up real network connections
- **Debugging**: It's easier to trace message flow when everything happens in memory
- **Examples and Demos**: It's perfect for simple examples that don't need real networking
- **Local Development**: Great for rapid development before integrating with real transports

**Real-world analogy:** If a normal Transport is like a phone call between two people in different locations, MemoryTransport is like two people sitting at the same table passing notes to each other - much simpler and more direct!

### Visual Overview

```
┌─────────────────────┐                  ┌─────────────────────┐
│                     │                  │                     │
│    MCP Server       │                  │    MCP Client       │
│                     │                  │                     │
└─────────┬───────────┘                  └─────────┬───────────┘
          │                                        │
          │                                        │
          ▼                                        ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      MemoryTransport                        │
│                                                             │
│  ┌─────────────┐            ┌───────────────────────────┐  │
│  │             │            │                           │  │
│  │   inbox[]   │◄───────────┤  send(message) method     │  │
│  │             │            │                           │  │
│  └──────┬──────┘            └───────────────────────────┘  │
│         │                                                   │
│         │                    ┌───────────────────────────┐  │
│         └────────────────────►                           │  │
│                              │  receive(message) method  │  │
│                              │                           │  │
│                              └───────────┬───────────────┘  │
│                                          │                  │
└──────────────────────────────────────────┼──────────────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │                 │
                                  │  messageHandler │
                                  │                 │
                                  └─────────────────┘
```

### How MemoryTransport Works

Unlike real transports that use networks, MemoryTransport simply:

1. Stores sent messages in an `inbox` array
2. Provides a `receive` method to manually inject messages

This makes it perfect for testing and examples, as you have complete control over the message flow.

```typescript
class MemoryTransport implements Transport {
  // Stores the message handler function provided by the server
  private messageHandler: ((message: JsonRpcMessage) => void) | null = null;
  
  // Stores all outgoing messages for inspection during testing
  public inbox: JsonRpcMessage[] = [];
  
  // Implements Transport interface methods
  start(): void {
    // Nothing to start - it's all in memory!
    console.log('MemoryTransport started');
  }
  
  stop(): void {
    // Nothing to stop - it's all in memory!
    console.log('MemoryTransport stopped');
  }
  
  send(message: JsonRpcMessage): void {
    // Store sent messages in the inbox for later inspection
    this.inbox.push(message);
    console.log('Message sent to inbox:', message);
  }
  
  onMessage(handler: (message: JsonRpcMessage) => void): void {
    // Store the handler function for later use with receive()
    this.messageHandler = handler;
    console.log('Message handler registered');
  }
  
  // Additional method for testing - not part of the Transport interface
  receive(message: JsonRpcMessage): void {
    // Simulate receiving a message by calling the handler
    if (this.messageHandler) {
      this.messageHandler(message);
      console.log('Message received and processed:', message);
    } else {
      console.warn('No message handler registered!');
    }
  }
}
```

### When to Use MemoryTransport

✅ **Perfect for:**

- Unit testing your MCP server
- Learning how the MCP protocol works
- Rapid prototyping without network setup
- Examples and tutorials

❌ **Not suitable for:**

- Production applications
- Communication between separate processes
- Real distributed systems

### Methods

Includes all methods from the `Transport` interface, plus:

#### receive

> 🔄 **Simulate Incoming Messages**

Simulates receiving a message from a client. This is what makes MemoryTransport special - you can manually trigger incoming messages!

```typescript
receive(message: JsonRpcMessage): void
```

**When to use it:** This method is unique to MemoryTransport and is not part of the standard Transport interface. Use it during testing to simulate client messages without needing actual network communication.

**What happens during receive():**

1. The transport checks if a message handler has been registered
2. If a handler exists, it calls the handler with the provided message
3. The message flows through the McpServer just as if it came from a real client

**Parameters explained:**

- `message`: The JSON-RPC message to process as if it came from a client

**Example usage:**

```typescript
// Step 1: Create a memory transport and server
const transport = new MemoryTransport();
const server = new McpServer(transport, { name: "Test Server" });

// Step 2: Set up a handler for the "ping" method
server.on("ping", () => {
  return { pong: true, timestamp: Date.now() };
});

// Step 3: Start the server
await server.start();

// Step 4: Simulate receiving a ping request from a client
transport.receive({
  jsonrpc: "2.0",
  id: "123",
  method: "ping",
  params: {}
});

// Step 5: Check the inbox for the response
console.log("Response:", transport.inbox[0]);
// Output will be something like:
// Response: {
//   jsonrpc: "2.0",
//   id: "123",
//   result: { pong: true, timestamp: 1621234567890 }
// }
```

**Testing Multiple Scenarios:**

```typescript
// Create transport and server
const transport = new MemoryTransport();
const server = new McpServer(transport, { name: "Test Server" });

// Register handlers
server.on("add", (params: { a: number, b: number }) => {
  return { sum: params.a + params.b };
});

server.on("echo", (params: { message: string }) => {
  return { echo: params.message };
});

await server.start();

// Test scenario 1: Addition
transport.receive({
  jsonrpc: "2.0",
  id: "test1",
  method: "add",
  params: { a: 5, b: 3 }
});

// Test scenario 2: Echo
transport.receive({
  jsonrpc: "2.0",
  id: "test2",
  method: "echo",
  params: { message: "Hello, world!" }
});

// Check results
console.log("Addition result:", transport.inbox[0]);
// { jsonrpc: "2.0", id: "test1", result: { sum: 8 } }

console.log("Echo result:", transport.inbox[1]);
// { jsonrpc: "2.0", id: "test2", result: { echo: "Hello, world!" } }
```

## Handler Type

> 👨‍🍳 **The Function That Does the Real Work**

### What is a Handler?

A `Handler` is a function that processes requests for a specific method in your MCP server. Think of it as the actual worker that fulfills client requests.

**Real-world analogy:** If your MCP server is a restaurant, and the Transport is the waitstaff, then Handlers are the chefs who prepare specific dishes. Each chef (handler) specializes in a particular dish (method).

### Visual Overview

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        MCP Server                           │
│                                                             │
│  ┌─────────────────────┐      ┌─────────────────────────┐  │
│  │                     │      │                         │  │
│  │  Incoming Request   │─────►│   Method: "add"        │──┐  │
│  │  method: "add"      │      │                         │  │  │
│  │  params: {a:5, b:3} │      └─────────────────────────┘  │  │
│  │                     │                                   │  │
│  └─────────────────────┘                                   │  │
│                                                            │  │
│                                                            ▼  │
│                                      ┌───────────────────────┐│
│                                      │                       ││
│                                      │  Handler Function     ││
│                                      │  for "add" method     ││
│                                      │                       ││
│                                      │  (params, request) => ││
│                                      │    return {sum: a+b}  ││
│                                      │                       ││
│                                      └───────────┬───────────┘│
│                                                  │            │
│  ┌─────────────────────┐      ┌─────────────────▼─────────┐  │
│  │                     │      │                           │  │
│  │  Outgoing Response  │◄─────┤   Result: {sum: 8}        │  │
│  │  result: {sum: 8}   │      │                           │  │
│  │                     │      └───────────────────────────┘  │
│  └─────────────────────┘                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Handler Function Signature

```typescript
type Handler = (
  params: unknown,
  request: JsonRpcRequest
) => Promise<unknown> | unknown;
```

**Parameters explained:**

- `params`: The data sent by the client (like ingredients for a recipe). This could be anything - a string, number, object, or array, depending on what the client sends.
- `request`: The complete JSON-RPC request object, which includes the method name, ID, and params. This gives you access to all details about the request if you need them.

**Returns:**

- Whatever you want to send back to the client. This can be any valid JSON data, or a Promise that will eventually resolve to that data (for asynchronous operations).

### Handler Examples

**Example 1: Simple Synchronous Handler**

```typescript
// A handler that adds two numbers
const addHandler: Handler = (params: { a: number, b: number }) => {
  // Extract the parameters
  const { a, b } = params;
  
  // Perform the calculation
  const sum = a + b;
  
  // Return the result
  return { sum };
};

// Register it with your server
server.on("add", addHandler);

// Client can now call this method with: 
// { "jsonrpc": "2.0", "id": "123", "method": "add", "params": { "a": 5, "b": 3 } }
// And will receive: { "jsonrpc": "2.0", "id": "123", "result": { "sum": 8 } }
```

**Example 2: Asynchronous Handler with Database Access**

```typescript
// A handler that fetches user data from a database
const getUserHandler: Handler = async (params: { userId: string }) => {
  // Extract the userId parameter
  const { userId } = params;
  
  try {
    // Perform an asynchronous database lookup
    const user = await database.findUser(userId);
    
    // Return the user data
    return { user };
  } catch (error) {
    // You can throw errors and the McpServer will convert them to proper JSON-RPC errors
    throw new Error(`User not found: ${userId}`);
  }
};

// Register it with your server
server.on("getUser", getUserHandler);
```

**Example 3: Using the Request Object**

```typescript
// A handler that logs requests and returns metadata
const metadataHandler: Handler = (params, request) => {
  // Log the entire request
  console.log('Received request:', request);
  
  // Use information from the request object
  return {
    method: request.method,
    id: request.id,
    timestamp: Date.now(),
    paramsReceived: params
  };
};

// Register it with your server
server.on("getMetadata", metadataHandler);
```

### Best Practices for Handlers

✅ **Do:**

- Keep handlers focused on a single responsibility
- Use TypeScript types for your params to get better type checking
- Handle errors gracefully and provide meaningful error messages
- Use async/await for asynchronous operations

❌ **Don't:**

- Put too much logic in a single handler
- Forget to handle potential errors in asynchronous code
- Return undefined (always return a value or throw an error)
- Access external state without proper error handling
server.on("getUser", getUserHandler);

```

## JSON-RPC Types

### What is JSON-RPC?

JSON-RPC is a simple protocol for remote procedure calls (RPC) that uses JSON for data formatting. It's the language that clients and servers use to communicate in the Model Context Protocol.

**Why JSON-RPC?** It's lightweight, language-independent, and easy to understand. Many systems already support it, making integration easier.

#### Visual Overview of JSON-RPC Communication

```

┌─────────┐                                  ┌─────────┐
│         │  1. Request: {method, params}    │         │
│ Client  │ ─────────────────────────────────▶ Server  │
│         │                                  │         │
│         │  2. Response: {result or error}  │         │
│         │ ◀───────────────────────────────── │         │
└─────────┘                                  └─────────┘

```

#### For Beginners: Think of JSON-RPC Like...

...ordering food at a restaurant:
1. **You (the client)** look at a menu (available methods)
2. **You place an order** (send a request with method name and parameters)
3. **The kitchen (the server)** processes your order
4. **The waiter** brings back your food (result) or an apology (error)

The JSON-RPC protocol simply defines the format of these "order slips" and "delivery receipts" so both sides understand each other.

### JsonRpcRequest

This is the message format that clients use to call methods on your server.

```typescript
interface JsonRpcRequest {
  jsonrpc: "2.0";        // Protocol version - always "2.0"
  id?: string | number | null;  // Request identifier (optional for notifications)
  method: string;        // The method to call (like "add" or "getUser")
  params?: unknown;      // Data to pass to the method (optional)
}
```

#### Understanding Each Field

- **jsonrpc**: Always set to "2.0" to indicate the protocol version
- **id**: A unique identifier for matching responses to requests
  - Can be a string, number, or null
  - If omitted, the request is a "notification" (no response expected)
- **method**: The name of the function you want to call on the server
- **params**: The arguments to pass to that function (can be any valid JSON)

#### Example Requests

**Basic request with numeric parameters:**

```json
{
  "jsonrpc": "2.0",
  "id": "request-123",
  "method": "add",
  "params": { "a": 5, "b": 3 }
}
```

**Request with complex parameters:**

```json
{
  "jsonrpc": "2.0",
  "id": 456,
  "method": "createUser",
  "params": { 
    "user": {
      "name": "Alice",
      "email": "alice@example.com",
      "preferences": {
        "theme": "dark",
        "notifications": true
      }
    }
  }
}
```

**Notification (no response needed):**

```json
{
  "jsonrpc": "2.0",
  "method": "logEvent",
  "params": { "type": "user_login", "userId": "user-789" }
}
```

#### Common Patterns

- Use descriptive method names like `getUser`, `createDocument`, or `calculateTotal`
- Structure params as named objects rather than arrays for better readability
- Generate unique IDs for each request to track responses (UUIDs work well)
- Use notifications for fire-and-forget operations like logging

### JsonRpcResponse

This is the message format that your server sends back to clients after processing a request.

```typescript
interface JsonRpcResponse {
  jsonrpc: "2.0";        // Protocol version - always "2.0"
  id: string | number | null;  // Same ID as the request (for matching responses)
  result?: unknown;      // The result data (if successful)
  error?: JsonRpcError;  // Error information (if something went wrong)
}
```

#### Understanding Each Field

- **jsonrpc**: Always set to "2.0" to indicate the protocol version
- **id**: The same ID that was in the request (helps clients match responses to their requests)
- **result**: The data returned by the method (only present if the call was successful)
- **error**: Information about what went wrong (only present if the call failed)

> **Important:** A response will have either a `result` OR an `error`, never both.

#### Response Flow Diagram

```
┌─────────────────┐
│ Process Request │
└────────┬────────┘
         │
         ▼
   ┌───────────┐     Yes      ┌─────────────────┐
   │ Successful?│─────────────▶│ Return result   │
   └───────────┘              └─────────────────┘
         │
         │ No
         ▼
┌──────────────────┐
│ Return error     │
└──────────────────┘
```

#### Example Responses

**Successful response:**

```json
{
  "jsonrpc": "2.0",
  "id": "request-123",
  "result": { "sum": 8 }
}
```

**Error response:**

```json
{
  "jsonrpc": "2.0",
  "id": "request-123",
  "error": {
    "code": -32602,
    "message": "Invalid params: expected numbers"
  }
}
```

**Response to a complex request:**

```json
{
  "jsonrpc": "2.0",
  "id": 456,
  "result": {
    "user": {
      "id": "user-abc123",
      "name": "Alice",
      "email": "alice@example.com",
      "created": "2023-04-15T14:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> **Remember:** Notifications (requests without an ID) don't receive any response.

### JsonRpcError

This defines the structure of error information in responses when something goes wrong.

```typescript
interface JsonRpcError {
  code: number;          // Error code (standard codes or custom ones)
  message: string;       // Human-readable error message
  data?: unknown;        // Additional error details (optional)
}
```

#### Understanding Each Field

- **code**: A numeric error code that identifies the type of error
  - Standard codes are negative (like -32600 for "Invalid Request")
  - Custom codes should be positive or in the server error range (-32000 to -32099)
- **message**: A human-readable description of what went wrong
- **data**: Optional extra information about the error (can include request details, stack traces, etc.)

#### When Are Errors Used?

Errors can happen for many reasons:

- The method doesn't exist ("Method not found")
- The parameters are invalid (wrong types, missing required fields)
- There's a problem processing the request (business logic errors)
- The server encounters an internal error (exceptions, timeouts)

> **Good to know:** The McpServer handles many standard errors automatically, but you can also throw your own errors in handlers.

#### Visual Guide to Error Handling

```
┌─────────────┐  Request   ┌─────────────┐
│             │────────────▶│             │
│   Client    │            │   Server    │
│             │◀────────────│             │
└─────────────┘  Response  └──────┬──────┘
                              ▲    │
                              │    │
                              │    ▼
┌─────────────────────────────┴────┴──────────────────────────┐
│ if (methodNotFound)    → return error code -32601          │
│ if (invalidParams)     → return error code -32602          │
│ if (internalException) → return error code -32603          │
│ if (customError)       → return your custom error code     │
└─────────────────────────────────────────────────────────────┘
```

#### Example of Throwing Custom Errors

```typescript
// In your handler
const getUserHandler: Handler = async (params) => {
  // Validate params
  if (!params.userId) {
    throw {
      code: -32602,  // Invalid params
      message: "Missing required parameter: userId"
    };
  }
  
  // Business logic error
  if (params.userId === "deleted-user") {
    throw {
      code: 100,  // Custom error code
      message: "User has been deleted",
      data: {
        userId: params.userId,
        deletedAt: "2023-05-10T15:30:00Z"
      }
    };
  }
  
  // Continue with normal processing...
};
```

## Error Codes

### Understanding JSON-RPC Error Codes

When something goes wrong with a request, the server returns an error with a specific code. These codes help identify what kind of problem occurred.

```typescript
enum JSON_RPC_ERROR {
  PARSE_ERROR = -32700,      // Invalid JSON was received
  INVALID_REQUEST = -32600,  // The request is not a valid JSON-RPC request
  METHOD_NOT_FOUND = -32601, // The requested method doesn't exist
  INVALID_PARAMS = -32602,   // The parameters provided are invalid
  INTERNAL_ERROR = -32603,   // Internal server error
  // Server error codes (reserved): -32000 to -32099
}
```

#### Standard Error Codes Explained

| Error Code | Name | Description | Example Scenario |
|------------|------|-------------|------------------|
| -32700 | PARSE_ERROR | The server couldn't parse the JSON | Missing comma, unbalanced brackets |
| -32600 | INVALID_REQUEST | Valid JSON but invalid JSON-RPC format | Missing required fields like "jsonrpc" or "method" |
| -32601 | METHOD_NOT_FOUND | The requested method doesn't exist | Calling "getUserProfile" when only "getUser" exists |
| -32602 | INVALID_PARAMS | Parameters are invalid for the method | Sending strings when numbers are expected |
| -32603 | INTERNAL_ERROR | Server encountered an unexpected problem | Database connection failed, out of memory |
| -32000 to -32099 | SERVER_ERROR | Reserved for implementation-defined server errors | Custom server-specific errors |

#### Visual Guide to Error Codes

```
┌───────────────────────────────────────────────────────────────┐
│                     Error Code Ranges                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  -32700                 -32600                    -32000      │
│     ▼                      ▼                        ▼         │
│  ┌──────┐              ┌──────┐                 ┌──────┐      │
│  │Parser│              │Protocol│                │Server│      │
│  │Errors│              │Errors │                │Errors│      │
│  └──────┘              └──────┘                 └──────┘      │
│                                                               │
│     ▲                      ▲                        ▲         │
│  -32700                 -32603                    -32099      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

#### Custom Error Codes

You can define your own error codes for application-specific errors:

- **Application errors**: Use positive numbers (e.g., 100 for "User not found")
- **Server-specific errors**: Use the range -32000 to -32099

```typescript
// Example of custom error codes
const APP_ERRORS = {
  USER_NOT_FOUND: 100,
  INSUFFICIENT_PERMISSIONS: 101,
  RATE_LIMIT_EXCEEDED: 102,
  // Server-specific errors
  DATABASE_ERROR: -32000,
  CACHE_ERROR: -32001
};
```

#### Example: Handling Errors in a Client

```typescript
async function callMethod(method, params) {
  try {
    // Send request to server...
    const response = await sendRequest({ jsonrpc: "2.0", id: "123", method, params });
    
    if (response.error) {
      // Handle standard errors
      switch (response.error.code) {
        case -32601:
          console.error(`Method '${method}' doesn't exist on the server`);
          // Maybe show available methods to the user
          break;
        case -32602:
          console.error(`Invalid parameters for method '${method}':`, params);
          // Maybe show parameter requirements
          break;
        // Handle custom application errors
        case 100: // USER_NOT_FOUND
          console.error(`User not found: ${params.userId}`);
          break;
        default:
          console.error(`Error ${response.error.code}: ${response.error.message}`);
      }
      throw new Error(response.error.message);
    }
    
    return response.result;
  } catch (networkError) {
    // Handle network/connection errors
    console.error("Network error:", networkError);
    throw networkError;
  }
}
```

#### Best Practices for Error Handling

✅ **Do:**

- Use standard error codes for standard problems
- Create a consistent set of custom error codes for your application
- Include helpful information in the error message and data
- Document your custom error codes for client developers

❌ **Don't:**

- Use standard error codes for application-specific errors
- Return success responses when errors occur
- Include sensitive information in error messages or data
- Use different error codes for the same error condition

## Utility Functions

### Helper Functions for JSON-RPC

BMAD-MCP provides several utility functions to make working with JSON-RPC messages easier. These functions help you create properly formatted responses and check message types without having to manually construct the objects.

#### Why Use Utility Functions?

```
┌───────────────────────────────────────────────────────────────┐
│                   Without Utility Functions                    │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  const response = {                                           │
│    jsonrpc: "2.0",                                            │
│    id: requestId,                                            │
│    result: { data: "value" }                                 │
│  };                                                          │
│                                                               │
└───────────────────────────────────────────────────────────────┘

                              VS

┌───────────────────────────────────────────────────────────────┐
│                   With Utility Functions                      │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  const response = makeResult(requestId, { data: "value" });   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### makeResult

Creates a properly formatted successful JSON-RPC response.

```typescript
makeResult(id: string | number | null, result: unknown): JsonRpcResponse
```

#### Parameters Explained

- `id`: The ID from the request that this response is answering
- `result`: The data to return to the client

#### When to Use

- When your handler successfully processes a request and needs to return data
- When you want to ensure your response follows the JSON-RPC 2.0 specification
- When you need to create responses in middleware or utility functions

#### Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────┐                                                │
│  │ Request │                                                │
│  └────┬────┘                                                │
│       │                                                     │
│       ▼                                                     │
│  ┌────────────┐    Success    ┌───────────────────────────┐  │
│  │            │               │ makeResult(               │  │
│  │  Handler   │─────────────▶│   id,                     │  │
│  │            │               │   result                  │  │
│  └────────────┘               │ )                         │  │
│                               └───────────┬───────────────┘  │
│                                           │                  │
│                                           ▼                  │
│                               ┌───────────────────────────┐  │
│                               │ {                         │  │
│                               │   jsonrpc: "2.0",         │  │
│                               │   id: <id>,              │  │
│                               │   result: <result>        │  │
│                               │ }                         │  │
│                               └───────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Basic Example

```typescript
// Create a success response
const response = makeResult(
  "request-123",
  { username: "alice", email: "alice@example.com" }
);

// Result:
// {
//   jsonrpc: "2.0",
//   id: "request-123",
//   result: { username: "alice", email: "alice@example.com" }
// }
```

#### Real-World Example: Response Middleware

```typescript
// A middleware function that wraps handler responses
function addTimestampMiddleware(handler) {
  return async (params, request) => {
    // Call the original handler
    const result = await handler(params, request);
    
    // Add timestamp to the result
    const enhancedResult = {
      ...result,
      timestamp: new Date().toISOString(),
      requestDuration: calculateDuration(request)
    };
    
    // Use makeResult to ensure proper formatting
    return makeResult(request.id, enhancedResult);
  };
}

// Usage
server.on("getUserProfile", addTimestampMiddleware(async (params) => {
  const user = await database.findUser(params.userId);
  return {
    profile: user.profile,
    settings: user.settings
  };
}));
```

- When you're manually constructing a response outside of the standard handler flow
- When you need to ensure your response follows the JSON-RPC 2.0 specification

```

### makeError

Creates a properly formatted error JSON-RPC response.

```typescript
makeError(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse
```

#### Parameters Explained

- `id`: The ID from the request that this response is answering
- `code`: The error code (usually from the JSON_RPC_ERROR enum)
- `message`: A human-readable error message
- `data`: (Optional) Additional information about the error

#### When to Use

- When your handler encounters an error condition
- When you need to return a standardized error response
- When you want to include additional error details for debugging

#### Visual Guide to Error Creation

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────┐                                                │
│  │ Request │                                                │
│  └────┬────┘                                                │
│       │                                                     │
│       ▼                                                     │
│  ┌────────────┐    Error     ┌───────────────────────────┐  │
│  │            │   Occurs     │ makeError(                │  │
│  │  Handler   │─────────────▶│   id,                     │  │
│  │            │              │   code,                   │  │
│  └────────────┘              │   message,                │  │
│                              │   data                    │  │
│                              │ )                         │  │
│                              └───────────┬───────────────┘  │
│                                          │                  │
│                                          ▼                  │
│                              ┌───────────────────────────┐  │
│                              │ {                         │  │
│                              │   jsonrpc: "2.0",         │  │
│                              │   id: <id>,              │  │
│                              │   error: {               │  │
│                              │     code: <code>,        │  │
│                              │     message: <message>,  │  │
│                              │     data: <data>         │  │
│                              │   }                      │  │
│                              │ }                         │  │
│                              └───────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Example

```typescript
// Create an error response
const response = makeError(
  "request-123",
  JSON_RPC_ERROR.INVALID_PARAMS,
  "Missing required parameter 'username'",
  { provided: { password: "***" } }
);

// Result:
// {
//   jsonrpc: "2.0",
//   id: "request-123",
//   error: {
//     code: -32602,
//     message: "Missing required parameter 'username'",
//     data: { provided: { password: "***" } }
//   }
// }
```

#### Real-World Example: Validation Error Handler

```typescript
// A handler that validates user input
const createUserHandler: Handler = (params, request) => {
  // Validate required fields
  const requiredFields = ['username', 'email', 'password'];
  const missingFields = requiredFields.filter(field => !params[field]);
  
  if (missingFields.length > 0) {
    // Use makeError to create a standardized error response
    throw makeError(
      request.id,
      JSON_RPC_ERROR.INVALID_PARAMS,
      `Missing required fields: ${missingFields.join(', ')}`,
      {
        required: requiredFields,
        provided: Object.keys(params),
        missing: missingFields
      }
    );
  }
  
  // Continue with user creation...
  return { userId: generateId(), username: params.username };
};
```

### isNotification

Checks if a request is a notification (has no ID). Notifications are special requests that don't require a response.

```typescript
isNotification(req: JsonRpcRequest): boolean
```

#### Parameters Explained

- `req`: The JSON-RPC request to check

#### Returns

- `true` if the request is a notification (has no ID)
- `false` if the request requires a response (has an ID)

#### What Are Notifications?

Notifications are special JSON-RPC requests that:

- Don't include an `id` field
- Don't expect any response from the server
- Are processed by the server but don't generate a response
- Are useful for fire-and-forget operations

#### Visual Comparison

```
┌───────────────────────────────────────────────────────────────┐
│                 Standard Request vs Notification               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Standard Request:                      Notification:         │
│  ┌────────────────────────┐            ┌────────────────────┐ │
│  │ {                      │            │ {                  │ │
│  │   jsonrpc: "2.0",      │            │   jsonrpc: "2.0",  │ │
│  │   id: "abc123",        │            │   method: "log",   │ │
│  │   method: "add",       │            │   params: {...}    │ │
│  │   params: {...}        │            │ }                  │ │
│  │ }                      │            └────────────────────┘ │
│  └────────────────────────┘                                   │
│           │                                    │              │
│           ▼                                    ▼              │
│  ┌────────────────────────┐                   ×              │
│  │ Response Required      │            No Response Sent      │
│  └────────────────────────┘                                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

#### Example

```typescript
// Check if a request is a notification
const request1 = { jsonrpc: "2.0", method: "log", params: { message: "Hello" } };
const request2 = { jsonrpc: "2.0", id: "123", method: "add", params: { a: 1, b: 2 } };

console.log(isNotification(request1)); // true - no response needed
console.log(isNotification(request2)); // false - must send a response
```

#### When to Use Notifications

Notifications are perfect for:

- **Logging**: Recording user actions or system events
- **Analytics**: Tracking usage patterns without blocking the client
- **Status updates**: Informing the server about client state changes
- **Events**: Broadcasting events that don't need acknowledgment

#### Real-World Example: Activity Logger

```typescript
// Client-side code
function logUserActivity(action, details) {
  // Create a notification (no ID field)
  const notification = {
    jsonrpc: "2.0",
    method: "logActivity",
    params: {
      action,
      details,
      timestamp: Date.now(),
      sessionId: getCurrentSessionId()
    }
  };
  
  // Send without waiting for a response
  sendToServer(notification);
  
  // Continue immediately - no waiting
  return true;
}

// Server-side handler
server.on("logActivity", (params) => {
  // Process the log entry
  storeInDatabase(params);
  
  // No return value needed for notifications
  // Even if we return something, it won't be sent back
});
```
