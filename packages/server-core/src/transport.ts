import type { JsonRpcMessage } from "@bmad/core-protocol";

export interface Transport {
  start(): Promise<void> | void;
  stop(): Promise<void> | void;
  send(message: JsonRpcMessage): Promise<void> | void;
  onMessage(handler: (message: JsonRpcMessage) => void): void;
}

// A simple in-memory transport for testing
export class MemoryTransport implements Transport {
  private handler?: (message: JsonRpcMessage) => void;
  public inbox: JsonRpcMessage[] = [];

  start(): void {}
  stop(): void {}

  send(message: JsonRpcMessage): void {
    this.inbox.push(message);
  }

  onMessage(handler: (message: JsonRpcMessage) => void): void {
    this.handler = handler;
  }

  // Helper for tests to inject a message to the server
  receive(message: JsonRpcMessage): void {
    this.handler?.(message);
  }
}

