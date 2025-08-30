# Transport Layer

## 🚀 Welcome to the Transport Layer

Welcome to the Transport Layer documentation! This guide will help you understand how communication works in BMAD-MCP and how you can customize it for your needs.

## Overview

### What is the Transport Layer?

The Transport Layer in BMAD-MCP is responsible for handling the communication between the MCP server and its clients. It abstracts the underlying communication mechanism, allowing the server to work with different transport protocols without changing its core logic.

### 💡 Real-World Analogy

Think of the Transport Layer as the postal service in a city:

- The **MCP Server** is like a business headquarters that needs to send and receive messages
- The **Transport Layer** is like the postal service that delivers those messages
- Different **Transport implementations** are like different delivery methods (regular mail, express delivery, digital messages)
- The **clients** are like the recipients of those messages

Just as a business doesn't need to know how the postal service works internally, the MCP Server doesn't need to know the details of how messages are transmitted. It just hands off messages to the Transport Layer and receives incoming messages from it.

### Visual Representation

```
┌─────────────────┐                                  ┌─────────────────┐
│                 │                                  │                 │
│                 │                                  │                 │
│    Client A     │◄─────────────────────────────────│                 │
│                 │                                  │                 │
│                 │                                  │                 │
└─────────────────┘                                  │                 │
                                                     │                 │
                                                     │   MCP Server   │
┌─────────────────┐       Transport Layer           │                 │
│                 │                                  │                 │
│                 │                                  │                 │
│    Client B     │◄─────────────────────────────────│                 │
│                 │                                  │                 │
│                 │                                  │                 │
└─────────────────┘                                  └─────────────────┘
                                                     
                                                     
┌─────────────────┐                                  
│                 │                                  
│                 │                                  
│    Client C     │◄─────────────────────────────────
│                 │                                  
│                 │                                  
└─────────────────┘                                  
```

### Why is the Transport Layer Important?

1. **Flexibility**: You can switch between different communication protocols (WebSockets, HTTP, IPC, etc.) without changing your server logic
2. **Testability**: You can use in-memory transports for testing without setting up network infrastructure
3. **Separation of Concerns**: Your business logic remains clean and focused, while communication details are handled separately
4. **Scalability**: You can optimize the transport for your specific needs (e.g., adding load balancing, encryption, or compression)

## Transport Interface

### 🧩 The Building Blocks of Communication

All transport implementations must implement the `Transport` interface. This interface defines the contract that any transport mechanism must fulfill to work with the MCP Server.

```typescript
interface Transport {
  start(): Promise<void> | void;
  stop(): Promise<void> | void;
  send(message: JsonRpcMessage): Promise<void> | void;
  onMessage(handler: (message: JsonRpcMessage) => void): void;
}
```

### Methods Explained

#### `start()`

**Purpose**: Initializes the transport and prepares it to send and receive messages.

**When it's called**: When the MCP Server starts up and needs to begin communication.

**What it does**:

- Opens network connections
- Initializes communication channels
- Prepares any resources needed for message handling

**Example implementation**:

```typescript
async start(): Promise<void> {
  // For a WebSocket transport
  this.server = new WebSocket.Server({ port: this.port });
  
  this.server.on('connection', (client) => {
    // Set up event handlers for this client
    this.setupClientHandlers(client);
  });
  
  console.log(`Transport started on port ${this.port}`);
}
```

#### `stop()`

**Purpose**: Cleans up resources and stops the transport in a graceful way.

**When it's called**: When the MCP Server is shutting down or needs to temporarily stop communication.

**What it does**:

- Closes network connections
- Releases resources
- Performs any necessary cleanup

**Example implementation**:

```typescript
async stop(): Promise<void> {
  // For a WebSocket transport
  return new Promise((resolve) => {
    // Close all client connections
    for (const client of this.clients) {
      client.close();
    }
    
    // Close the server
    this.server.close(() => {
      console.log('Transport stopped');
      resolve();
    });
  });
}
```

#### `send(message)`

**Purpose**: Sends a JSON-RPC message through the transport to the appropriate recipient(s).

**When it's called**: When the MCP Server needs to send a response or notification to a client.

**What it does**:

- Serializes the message (if needed)
- Transmits the message through the appropriate channel
- Handles any sending errors

**Example implementation**:

```typescript
async send(message: JsonRpcMessage): Promise<void> {
  // For a WebSocket transport
  const serializedMessage = JSON.stringify(message);
  
  // If the message has an ID, it's a response to a specific client
  if ('id' in message && message.id !== null) {
    const client = this.clientMap.get(message.id);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(serializedMessage);
    }
  } else {
    // If it's a notification, broadcast to all clients
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serializedMessage);
      }
    }
  }
}
```

#### `onMessage(handler)`

**Purpose**: Registers a callback function that will be called whenever a message is received.

**When it's called**: When the MCP Server is setting up and needs to specify how incoming messages should be handled.

**What it does**:

- Stores the provided handler function
- Ensures that incoming messages are passed to this handler

**Example implementation**:

```typescript
onMessage(handler: (message: JsonRpcMessage) => void): void {
  this.messageHandler = handler;
  
  // Now when messages come in, we'll call this handler
  // For example, in a WebSocket's 'message' event:
  // client.on('message', (data) => {
  //   try {
  //     const message = JSON.parse(data.toString());
  //     this.messageHandler(message);
  //   } catch (error) {
  //     console.error('Failed to parse message:', error);
  //   }
  // });
}
```

### 💡 Understanding the Interface Design

The Transport interface follows the **separation of concerns** principle:

1. **Lifecycle Management**: `start()` and `stop()` handle the transport's lifecycle
2. **Message Sending**: `send()` handles outgoing messages
3. **Message Receiving**: `onMessage()` handles incoming messages

This clean separation makes it easy to implement different transport mechanisms while keeping the same consistent interface for the MCP Server to work with.

## Built-in Transports

### 📦 Ready-to-Use Communication Options

BMAD-MCP comes with built-in transport implementations that you can use right away without having to create your own. These provide a starting point and examples for how to implement the Transport interface.

### MemoryTransport

#### What is it?

The `MemoryTransport` is an in-memory implementation of the Transport interface. It doesn't use any network communication - instead, it keeps messages in memory and delivers them directly to handlers.

#### When to use it?

- **Unit Testing**: Perfect for testing your MCP server without network dependencies
- **Demonstrations**: Great for simple examples and tutorials
- **Local Development**: Useful when you're developing and don't need actual network communication
- **Same-Process Communication**: When your client and server are in the same process

#### How it works

The `MemoryTransport` works by:

1. Storing incoming messages in an inbox array
2. Providing a `receive()` method that simulates receiving a message from a client
3. Calling the registered message handler directly when `receive()` is called

```typescript
class MemoryTransport implements Transport {
  private handler?: (message: JsonRpcMessage) => void;
  public inbox: JsonRpcMessage[] = [];

  start(): void {
    // Nothing to initialize for in-memory transport
  }
  
  stop(): void {
    // Nothing to clean up for in-memory transport
  }

  send(message: JsonRpcMessage): void {
    // Store the message in the inbox for inspection in tests
    this.inbox.push(message);
  }

  onMessage(handler: (message: JsonRpcMessage) => void): void {
    // Store the handler function for later use
    this.handler = handler;
  }

  // Helper for tests to inject a message to the server
  receive(message: JsonRpcMessage): void {
    // Simulate receiving a message by calling the handler directly
    this.handler?.(message);
  }
}
```

#### Example Usage

Here's how you might use the `MemoryTransport` in a test scenario:

```typescript
import { McpServer, MemoryTransport } from '@bmad/server-core';

describe('MCP Server', () => {
  it('should handle echo requests', async () => {
    // Create a memory transport
    const transport = new MemoryTransport();
    
    // Create an MCP server with the transport
    const server = new McpServer(transport, {
      name: 'test-server',
      version: '1.0.0'
    });
    
    // Register an echo handler
    server.on('echo', async (params) => {
      return { message: params.message };
    });
    
    // Start the server
    await server.start();
    
    // Simulate receiving a message from a client
    transport.receive({
      jsonrpc: '2.0',
      id: '1',
      method: 'echo',
      params: { message: 'Hello, world!' }
    });
    
    // Check that the server responded correctly
    expect(transport.inbox).toHaveLength(1);
    expect(transport.inbox[0]).toEqual({
      jsonrpc: '2.0',
      id: '1',
      result: { message: 'Hello, world!' }
    });
    
    // Clean up
    await server.stop();
  });
});
```

### 💡 Real-World Analogy

The `MemoryTransport` is like passing notes directly to someone sitting next to you, rather than sending a letter through the mail. There's no actual delivery system involved - you're just handing the message directly to the recipient.

```

## Implementing Custom Transports

### 🔧 Building Your Own Communication Channels

One of the most powerful features of BMAD-MCP is the ability to create your own custom transports to support different communication protocols. This allows you to integrate MCP into virtually any system or environment.

### When to Create a Custom Transport

You might want to create a custom transport when:

- You need to use a specific communication protocol not provided out-of-the-box
- You have special requirements for message handling, security, or performance
- You want to integrate with an existing system that uses a particular communication method
- You need to add features like compression, encryption, or custom authentication

### Step-by-Step Guide to Creating a Custom Transport

1. **Create a new class** that implements the `Transport` interface
2. **Implement the required methods**: `start()`, `stop()`, `send()`, and `onMessage()`
3. **Add any additional functionality** specific to your transport needs
4. **Test your transport** thoroughly to ensure it works correctly

### Example: WebSocket Transport

Here's a complete example of a WebSocket transport implementation with detailed comments:

```typescript
import WebSocket from 'ws';
import { Transport, JsonRpcMessage } from '@bmad/core-protocol';

/**
 * A transport implementation that uses WebSockets for communication.
 * This allows real-time bidirectional communication between clients and the server.
 */
export class WebSocketTransport implements Transport {
  // Store the WebSocket server instance
  private server: WebSocket.Server;
  // Keep track of connected clients
  private clients: Set<WebSocket> = new Set();
  // Store the message handler function
  private messageHandler?: (message: JsonRpcMessage) => void;

  /**
   * Create a new WebSocketTransport that listens on the specified port.
   */
  constructor(port: number) {
    this.server = new WebSocket.Server({ port });
    console.log(`WebSocket transport created on port ${port}`);
  }

  /**
   * Start the transport by setting up event handlers for the WebSocket server.
   */
  async start(): Promise<void> {
    // Set up the connection event handler
    this.server.on('connection', (ws) => {
      console.log('New client connected');
      // Add the client to our set of connected clients
      this.clients.add(ws);
      
      // Set up the message event handler for this client
      ws.on('message', (data) => {
        try {
          // Parse the incoming message as JSON
          const message = JSON.parse(data.toString()) as JsonRpcMessage;
          console.log('Received message:', message);
          // Pass the message to the registered handler
          this.messageHandler?.(message);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      });

      // Set up the close event handler for this client
      ws.on('close', () => {
        console.log('Client disconnected');
        // Remove the client from our set when they disconnect
        this.clients.delete(ws);
      });
    });

    console.log('WebSocket transport started');
  }

  /**
   * Stop the transport by closing the WebSocket server.
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Stopping WebSocket transport...');
      // Close the server and resolve the promise when done
      this.server.close(() => {
        console.log('WebSocket transport stopped');
        resolve();
      });
    });
  }

  /**
   * Send a JSON-RPC message to all connected clients.
   */
  async send(message: JsonRpcMessage): Promise<void> {
    console.log('Sending message:', message);
    // Convert the message to a JSON string
    const data = JSON.stringify(message);
    // Send the message to all connected clients that are ready
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  /**
   * Register a handler function to be called when messages are received.
   */
  onMessage(handler: (message: JsonRpcMessage) => void): void {
    console.log('Registering message handler');
    this.messageHandler = handler;
  }
}
```

### Example: HTTP Transport

Here's an example of an HTTP transport implementation with detailed comments:

```typescript
import http from 'http';
import { Transport, JsonRpcMessage } from '@bmad/core-protocol';

/**
 * A transport implementation that uses HTTP for communication.
 * This is useful for systems that prefer request/response patterns
 * or need to work with existing HTTP infrastructure.
 */
export class HttpTransport implements Transport {
  // Store the HTTP server instance
  private server: http.Server;
  // Store the message handler function
  private messageHandler?: (message: JsonRpcMessage) => void;
  // Map to store response objects for pending requests
  private responseQueue: Map<string | number, http.ServerResponse> = new Map();

  /**
   * Create a new HttpTransport that listens on the specified port.
   */
  constructor(port: number) {
    // Create an HTTP server that calls our handleRequest method for each request
    this.server = http.createServer(this.handleRequest.bind(this));
    // Start listening on the specified port
    this.server.listen(port);
    console.log(`HTTP transport created on port ${port}`);
  }

  /**
   * Handle an incoming HTTP request.
   */
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // Only accept POST requests for JSON-RPC
    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end('Method Not Allowed');
      return;
    }

    // Collect the request body
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    // Process the complete request
    req.on('end', () => {
      try {
        // Parse the body as a JSON-RPC message
        const message = JSON.parse(body) as JsonRpcMessage;
        console.log('Received message:', message);
        
        // Store the response object for later use if this is a request (not a notification)
        if ('id' in message && message.id !== null && message.id !== undefined) {
          this.responseQueue.set(message.id, res);
        } else {
          // For notifications, respond immediately with a 204 No Content
          res.writeHead(204);
          res.end();
        }
        
        // Pass the message to the registered handler
        this.messageHandler?.(message);
      } catch (err) {
        // If we can't parse the message, return a 400 Bad Request
        console.error('Failed to parse message:', err);
        res.writeHead(400);
        res.end('Invalid JSON-RPC message');
      }
    });
  }

  /**
   * Start the transport (no-op for HTTP as the server is started in the constructor).
   */
  async start(): Promise<void> {
    console.log('HTTP transport started');
    // Server is already started in constructor
  }

  /**
   * Stop the transport by closing the HTTP server.
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Stopping HTTP transport...');
      // Close the server and resolve the promise when done
      this.server.close(() => {
        console.log('HTTP transport stopped');
        resolve();
      });
    });
  }

  /**
   * Send a JSON-RPC message as an HTTP response.
   */
  async send(message: JsonRpcMessage): Promise<void> {
    console.log('Sending message:', message);
    // Only send responses for messages with an ID
    if ('id' in message && message.id !== null && message.id !== undefined) {
      // Get the stored response object for this message ID
      const res = this.responseQueue.get(message.id);
      if (res) {
        // Remove the response object from the queue
        this.responseQueue.delete(message.id);
        // Send the JSON-RPC message as the HTTP response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(message));
      } else {
        console.warn(`No response object found for message ID: ${message.id}`);
      }
    } else {
      console.warn('Cannot send response for message without ID');
    }
  }

  /**
   * Register a handler function to be called when messages are received.
   */
  onMessage(handler: (message: JsonRpcMessage) => void): void {
    console.log('Registering message handler');
    this.messageHandler = handler;
  }
}
```

### Other Transport Ideas

Here are some other transport types you might consider implementing:

- **IPC Transport**: For communication between processes on the same machine
- **Socket.IO Transport**: For real-time communication with fallbacks for older browsers
- **gRPC Transport**: For high-performance, strongly-typed communication
- **MQTT Transport**: For IoT and messaging applications
- **Redis Pub/Sub Transport**: For distributed systems using Redis
- **Electron IPC Transport**: For communication between main and renderer processes in Electron apps

```

## Best Practices

### 🌟 Guidelines for Reliable Transport Implementation

When implementing custom transports, following these best practices will help ensure your transport is reliable, maintainable, and performs well:

### Error Handling

- **Catch and log all exceptions** in network code to prevent crashes
- **Provide meaningful error messages** that help with debugging
- **Handle edge cases** like disconnections, timeouts, and malformed messages

```typescript
// Example of good error handling
try {
  const message = JSON.parse(data.toString()) as JsonRpcMessage;
  this.messageHandler?.(message);
} catch (err) {
  console.error(`Error parsing message: ${err.message}`);
  console.debug('Raw message data:', data.toString().substring(0, 100));
  // Optionally notify the sender about the error
  this.sendErrorResponse(clientId, 'parse_error', 'Failed to parse JSON-RPC message');
}
```

### Connection Management

- **Implement reconnection logic** with exponential backoff for transports that can lose connection
- **Handle graceful disconnection** to properly clean up resources
- **Monitor connection health** with heartbeats or ping/pong mechanisms

```typescript
// Example reconnection logic with exponential backoff
class ReconnectingTransport implements Transport {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000; // 1 second
  
  private async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    this.reconnectAttempts++;
    
    try {
      await this.connect();
      console.log('Reconnection successful');
      this.reconnectAttempts = 0;
    } catch (err) {
      console.error('Reconnection failed:', err);
      this.reconnect();
    }
  }
}
```

### Logging and Monitoring

- **Add detailed logging** at different levels (debug, info, warn, error)
- **Include correlation IDs** in logs to track message flow
- **Implement metrics collection** for message counts, sizes, and latency
- **Log transport lifecycle events** (start, stop, connect, disconnect)

```typescript
// Example of good logging practices
class LoggingTransport implements Transport {
  private msgCounter = 0;
  
  async send(message: JsonRpcMessage): Promise<void> {
    const msgId = ++this.msgCounter;
    const startTime = performance.now();
    
    console.debug(`[${msgId}] Sending message: ${JSON.stringify(message).substring(0, 100)}...`);
    
    try {
      await this.actualSend(message);
      const duration = performance.now() - startTime;
      console.debug(`[${msgId}] Message sent successfully in ${duration.toFixed(2)}ms`);
      this.recordMetric('message_send_time', duration);
      this.recordMetric('messages_sent', 1);
    } catch (err) {
      console.error(`[${msgId}] Failed to send message:`, err);
      this.recordMetric('message_send_failures', 1);
      throw err;
    }
  }
}
```

### Resource Management

- **Implement proper cleanup** in the `stop()` method
- **Close all connections** and release resources when stopping
- **Cancel any pending operations** to prevent memory leaks
- **Dispose of event listeners** to prevent memory leaks

```typescript
// Example of proper resource cleanup
async stop(): Promise<void> {
  console.log('Stopping transport...');
  
  // Cancel any pending operations
  this.pendingOperations.forEach(op => op.cancel());
  this.pendingOperations.clear();
  
  // Remove all event listeners
  this.eventEmitter.removeAllListeners();
  
  // Close all connections
  for (const connection of this.connections) {
    try {
      await connection.close();
    } catch (err) {
      console.warn('Error closing connection:', err);
    }
  }
  this.connections.clear();
  
  // Close the server
  return new Promise((resolve) => {
    this.server.close(() => {
      console.log('Transport stopped successfully');
      resolve();
    });
  });
}
```

### Performance Optimization

- **Batch small messages** when appropriate to reduce overhead
- **Implement message compression** for large payloads
- **Use binary formats** like MessagePack or Protocol Buffers for efficiency
- **Consider using worker threads** for CPU-intensive operations

### Testing

- **Test with different message sizes** from small to very large
- **Simulate network conditions** like high latency and packet loss
- **Test concurrent connections** to ensure scalability
- **Verify reconnection behavior** works as expected
- **Create integration tests** with actual MCP servers

### Security

- **Validate all incoming messages** before processing
- **Implement authentication** for sensitive operations
- **Use TLS/SSL** for secure communication
- **Add rate limiting** to prevent abuse
- **Sanitize error messages** to avoid leaking sensitive information

By following these best practices, you'll create transports that are robust, maintainable, and provide a great developer experience for users of your MCP implementation.

## Testing Custom Transports

### 🧪 Verifying Your Transport Works Correctly

Testing is a critical part of developing custom transports. Here's a beginner-friendly guide to testing your transport implementation:

### Basic Integration Test

The simplest way to test your custom transport is to integrate it with an MCP server and verify basic functionality:

```typescript
import { McpServer } from '@bmad/server-core';
import { MyCustomTransport } from './my-custom-transport';

async function testTransport() {
  // Create your custom transport
  const transport = new MyCustomTransport();
  
  // Create an MCP server with your transport
  const server = new McpServer(transport, {
    name: 'test-server',
    version: '0.1.0',
  });

  // Add a simple echo handler for testing
  server.on('echo', (params) => {
    console.log('Echo handler received:', params);
    return params;
  });

  // Start the server
  await server.start();
  console.log('Server started successfully');
  
  // Now you can test sending messages to the server through your transport
  // For example, if you have a client-side method to send messages:
  const response = await sendTestMessage({
    jsonrpc: '2.0',
    method: 'echo',
    params: { message: 'Hello, Transport!' },
    id: 1
  });
  
  // Verify the response
  console.log('Received response:', response);
  
  // Clean up when done
  await server.stop();
  console.log('Server stopped');
}

// Run the test
testTransport().catch(err => console.error('Test error:', err));
```

### Testing Tips for Beginners

1. **Start Simple**: Begin with basic functionality tests before adding complexity
2. **Test One Thing at a Time**: Focus each test on a specific aspect of your transport
3. **Use Console Logs**: Add detailed logging to help debug issues
4. **Test Edge Cases**: Try sending invalid messages, disconnecting during operations, etc.
5. **Automate Your Tests**: Use a testing framework like Jest or Mocha for more comprehensive testing

Remember that thorough testing is essential for creating reliable transports that will work well in production environments.
