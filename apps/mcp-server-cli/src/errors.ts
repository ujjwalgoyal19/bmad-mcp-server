export function asJsonRpcError(e: any) {
  const msg = e?.message || "Server error";
  const code =
    e?.code === "INVALID_INPUT"
      ? -32602 // JSON-RPC invalid params
      : -32000; // server error
  return { code, message: msg };
}
