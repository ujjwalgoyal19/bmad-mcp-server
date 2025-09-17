#!/usr/bin/env bun
import { loadTokens, loginInteractive } from "./auth";

const cmd = process.argv[2];
if (cmd === "login") {
  await loginInteractive();
  console.log("Logged in.");
} else if (cmd === "whoami") {
  const t = await loadTokens();
  console.log(t ? `user=${t.user_id} org=${t.org_id}` : "not logged in");
} else {
  console.log("Usage: bmad-mcp [login|whoami]");
}
