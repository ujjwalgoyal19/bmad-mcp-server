import { z } from "@bmad/core-protocol";
import { JsonRpcRequest } from "@bmad/core-protocol";
import type { Transport } from "./transport";
declare const InitializeParamsSchema: z.ZodObject<{
    protocolVersion: z.ZodOptional<z.ZodString>;
    capabilities: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    protocolVersion?: string | undefined;
    capabilities?: Record<string, any> | undefined;
}, {
    protocolVersion?: string | undefined;
    capabilities?: Record<string, any> | undefined;
}>;
declare const InitializeResultSchema: z.ZodObject<{
    protocolVersion: z.ZodString;
    capabilities: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    serverInfo: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version?: string | undefined;
    }, {
        name: string;
        version?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    protocolVersion: string;
    capabilities: Record<string, any>;
    serverInfo?: {
        name: string;
        version?: string | undefined;
    } | undefined;
}, {
    protocolVersion: string;
    capabilities?: Record<string, any> | undefined;
    serverInfo?: {
        name: string;
        version?: string | undefined;
    } | undefined;
}>;
export type InitializeParams = z.infer<typeof InitializeParamsSchema>;
export type InitializeResult = z.infer<typeof InitializeResultSchema>;
export type Handler = (params: unknown, request: JsonRpcRequest) => Promise<unknown> | unknown;
export interface McpServerOptions {
    name: string;
    version?: string;
    protocolVersion?: string;
}
export declare class McpServer {
    private transport;
    private handlers;
    private initialized;
    private readonly opts;
    constructor(transport: Transport, opts: McpServerOptions);
    on(method: string, handler: Handler): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    private dispatch;
    private handleInitialize;
}
export {};
//# sourceMappingURL=mcpServer.d.ts.map