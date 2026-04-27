import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import type { Application } from "./create-application.js";
import type { RequestContext } from "../shared/core-types.js";

interface JsonResponse {
  status: number;
  body: unknown;
}

function setCorsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN ?? "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Timezone");
}

function sendJson(res: ServerResponse, response: JsonResponse) {
  setCorsHeaders(res);
  res.statusCode = response.status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(response.body));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function resolveContext(app: Application, req: IncomingMessage): Promise<RequestContext> {
  const authHeader = req.headers.authorization;
  const timezoneHeader = req.headers["x-timezone"];
  const timezone = Array.isArray(timezoneHeader) ? timezoneHeader[0] : timezoneHeader || "Asia/Shanghai";
  return app.resolveRequestContext(authHeader, timezone);
}

function jsonError(status: number, message: string): JsonResponse {
  return { status, body: { error: { message } } };
}

function validateAuthBody(body: unknown): { email: string; password: string } {
  if (!body || typeof body !== "object") throw new Error("Request body is required.");
  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error("A valid email address is required.");
  }
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  return { email: email.trim().toLowerCase(), password };
}

async function route(app: Application, req: IncomingMessage, res: ServerResponse) {
  const method = req.method || "GET";

  if (method === "OPTIONS") {
    setCorsHeaders(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url || "/", "http://127.0.0.1");
  const pathname = url.pathname;

  try {
    if (method === "POST" && pathname === "/v1/auth/register") {
      const raw = await readJsonBody(req);
      const body = validateAuthBody(raw);
      return sendJson(res, { status: 201, body: await app.auth.register(body as never) });
    }

    if (method === "POST" && pathname === "/v1/auth/login") {
      const raw = await readJsonBody(req);
      const body = validateAuthBody(raw);
      return sendJson(res, { status: 200, body: await app.auth.login(body as never) });
    }

    if (pathname === "/v1/profile" && method === "GET") {
      const ctx = await resolveContext(app, req);
      return sendJson(res, { status: 200, body: await app.profile.getCurrentProfile(ctx) });
    }

    if (pathname === "/v1/profile" && method === "PUT") {
      const ctx = await resolveContext(app, req);
      const body = await readJsonBody(req);
      return sendJson(res, { status: 200, body: await app.profile.upsertProfile(ctx, body as never) });
    }

    if (pathname === "/v1/assessments" && method === "GET") {
      const ctx = await resolveContext(app, req);
      return sendJson(res, { status: 200, body: await app.assessments.listAssessments(ctx) });
    }

    if (pathname === "/v1/assessments" && method === "POST") {
      const ctx = await resolveContext(app, req);
      const body = await readJsonBody(req);
      return sendJson(res, { status: 201, body: await app.assessments.createAssessment(ctx, body as never) });
    }

    if (pathname === "/v1/foods" && method === "GET") {
      const ctx = await resolveContext(app, req);
      return sendJson(res, { status: 200, body: await app.nutrition.listFoodCatalog(ctx) });
    }

    const dailyLogMatch = pathname.match(/^\/v1\/daily-logs\/([^/]+)$/);
    const dailyLogDate = dailyLogMatch?.[1];
    if (dailyLogDate && method === "GET") {
      const ctx = await resolveContext(app, req);
      return sendJson(res, { status: 200, body: await app.tracking.getDailyLog(ctx, dailyLogDate) });
    }

    if (dailyLogDate && method === "PUT") {
      const ctx = await resolveContext(app, req);
      const body = await readJsonBody(req);
      return sendJson(res, { status: 200, body: await app.tracking.upsertDailyLog(ctx, dailyLogDate, body as never) });
    }

    const foodMatch = pathname.match(/^\/v1\/daily-logs\/([^/]+)\/foods$/);
    const foodLogDate = foodMatch?.[1];
    if (foodLogDate && method === "POST") {
      const ctx = await resolveContext(app, req);
      const body = await readJsonBody(req);
      return sendJson(res, { status: 201, body: await app.nutrition.addFoodEntry(ctx, foodLogDate, body as never) });
    }

    const analysisMatch = pathname.match(/^\/v1\/daily-logs\/([^/]+)\/analysis$/);
    const analysisLogDate = analysisMatch?.[1];
    if (analysisLogDate && method === "GET") {
      const ctx = await resolveContext(app, req);
      return sendJson(res, { status: 200, body: await app.nutrition.getNutritionAnalysis(ctx, analysisLogDate) });
    }

    if (pathname === "/v1/trends" && method === "GET") {
      const ctx = await resolveContext(app, req);
      return sendJson(res, {
        status: 200,
        body: await app.tracking.getTrend(ctx, {
          metric: String(url.searchParams.get("metric") || "weight") as never,
          rangeDays: Number(url.searchParams.get("rangeDays") || 28),
        }),
      });
    }

    if (pathname === "/health" && method === "GET") {
      return sendJson(res, { status: 200, body: { status: "ok", modules: app.describe().modules } });
    }

    return sendJson(res, jsonError(404, `No route for ${method} ${pathname}`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    if (message.toLowerCase().includes("unauthorized")) {
      return sendJson(res, jsonError(401, message));
    }
    if (
      message.includes("required") ||
      message.includes("valid email") ||
      message.includes("at least") ||
      message.includes("already exists") ||
      message.includes("Invalid email")
    ) {
      return sendJson(res, jsonError(400, message));
    }
    console.error("[server error]", error);
    return sendJson(res, jsonError(500, "An unexpected error occurred."));
  }
}

export function startHttpServer(app: Application, port: number) {
  const server = createServer((req, res) => {
    void route(app, req, res);
  });

  return new Promise<void>((resolve) => {
    server.listen(port, "0.0.0.0", () => {
      console.log(`HTTP server listening on http://0.0.0.0:${port}`);
      resolve();
    });
  });
}
