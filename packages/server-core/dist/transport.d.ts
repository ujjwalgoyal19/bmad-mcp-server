import type { JsonRpcMessage } from "@bmad/core-protocol";
export interface Transport {
    start(): Promise<void> | void;
    stop(): Promise<void> | void;
    send(message: JsonRpcMessage): Promise<void> | void;
    onMessage(handler: (message: JsonRpcMessage) => void): void;
}
export declare class MemoryTransport implements Transport {
    private handler?;
    inbox: JsonRpcMessage[];
    start(): void;
    stop(): void;
    send(message: JsonRpcMessage): void;
    onMessage(handler: (message: JsonRpcMessage) => void): void;
    receive(message: JsonRpcMessage): void;
}
//# sourceMappingURL=transport.d.ts.map