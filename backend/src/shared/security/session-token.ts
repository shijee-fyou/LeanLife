import { createHmac, timingSafeEqual } from "node:crypto";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: JwtPayload, secret: string): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verify(token: string, secret: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const header = parts[0]!;
  const body = parts[1]!;
  const sig = parts[2]!;
  const expected = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  try {
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as JwtPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export function createSessionTokens(userId: string, secret: string): SessionTokens {
  const now = Math.floor(Date.now() / 1000);
  return {
    accessToken: sign({ sub: userId, iat: now, exp: now + 86_400 }, secret),
    refreshToken: sign({ sub: userId, iat: now, exp: now + 2_592_000 }, secret),
  };
}

export function parseAccessToken(token: string, secret: string): { userId: string } | null {
  const payload = verify(token, secret);
  if (!payload) return null;
  return { userId: payload.sub };
}
