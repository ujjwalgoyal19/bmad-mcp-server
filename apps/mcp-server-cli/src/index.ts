import { makeServerContext } from "./context";
import { registerMcpMethods } from "./methods";
import { runStdioServer } from "./rpc";

registerMcpMethods();
await runStdioServer(makeServerContext);
