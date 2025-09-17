import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const HOME = process.env.HOME || process.cwd();
const CONFIG_DIR = join(HOME, ".bmad");
const TOKEN_FILE = join(CONFIG_DIR, "token.json");

export type AuthTokens = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user_id?: string;
  org_id?: string;
};

export async function loginInteractive(): Promise<AuthTokens> {
  console.log(
    "Open https://your-saas.example.com/device and enter code: 1234-5678"
  );
  const fake: AuthTokens = {
    access_token: randomBytes(16).toString("hex"),
    refresh_token: randomBytes(16).toString("hex"),
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user_id: "user_123",
    org_id: "org_123",
  };
  await persistTokens(fake);
  return fake;
}

export async function persistTokens(tok: AuthTokens) {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(TOKEN_FILE, JSON.stringify(tok, null, 2), "utf-8");
}

export async function loadTokens(): Promise<AuthTokens | null> {
  try {
    return JSON.parse(await readFile(TOKEN_FILE, "utf-8"));
  } catch {
    return null;
  }
}

export async function ensureAuth(): Promise<AuthTokens> {
  const envTok = process.env.BMAD_TOKEN
    ? ({ access_token: process.env.BMAD_TOKEN } as AuthTokens)
    : null;
  if (envTok) return envTok;
  const cached = await loadTokens();
  if (
    cached &&
    (!cached.expires_at || cached.expires_at > Date.now() / 1000 + 30)
  )
    return cached;
  return loginInteractive();
}
