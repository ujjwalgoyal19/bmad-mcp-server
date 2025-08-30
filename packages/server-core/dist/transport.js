"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryTransport = void 0;
// A simple in-memory transport for testing
class MemoryTransport {
    constructor() {
        this.inbox = [];
    }
    start() { }
    stop() { }
    send(message) {
        this.inbox.push(message);
    }
    onMessage(handler) {
        this.handler = handler;
    }
    // Helper for tests to inject a message to the server
    receive(message) {
        this.handler?.(message);
    }
}
exports.MemoryTransport = MemoryTransport;
//# sourceMappingURL=transport.js.map