export interface AppConfig {
  nodeEnv: string;
  appName: string;
  timezone: string;
  jwtSecret: string;
  databaseUrl: string | undefined;
}

export function createConfig(): AppConfig {
  const nodeEnv = process.env["NODE_ENV"] ?? "development";
  const jwtSecret = process.env["JWT_SECRET"];
  const databaseUrl = process.env["DATABASE_URL"];

  if (nodeEnv === "production") {
    if (!jwtSecret) throw new Error("JWT_SECRET env var is required in production.");
    if (!databaseUrl) throw new Error("DATABASE_URL env var is required in production.");
  }

  return {
    nodeEnv,
    appName: "LeanLife Backend",
    timezone: process.env["APP_TIMEZONE"] ?? "Asia/Shanghai",
    jwtSecret: jwtSecret ?? "dev-secret-change-in-production",
    databaseUrl,
  };
}
