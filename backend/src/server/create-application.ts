import { createAssessmentModule } from "../modules/assessments/index.js";
import { createAuthModule } from "../modules/auth/index.js";
import { createNutritionModule } from "../modules/nutrition/index.js";
import { createProfileModule } from "../modules/profile/index.js";
import { createTrackingModule } from "../modules/tracking/index.js";
import { createConfig } from "../shared/config/app-config.js";
import type { RequestContext } from "../shared/core-types.js";
import { DevDataStore } from "../shared/persistence/dev-data-store.js";
import { getPool } from "../shared/persistence/pg/pool.js";
import { PgAuthRepository } from "../shared/persistence/pg/pg-auth.repository.js";
import { PgProfileRepository } from "../shared/persistence/pg/pg-profile.repository.js";
import { PgAssessmentRepository } from "../shared/persistence/pg/pg-assessment.repository.js";
import { PgTrackingRepository } from "../shared/persistence/pg/pg-tracking.repository.js";
import { PgNutritionRepository } from "../shared/persistence/pg/pg-nutrition.repository.js";
import { LocalAuthRepository } from "../modules/auth/auth.repository.js";
import { LocalProfileRepository } from "../modules/profile/profile.repository.js";
import { LocalAssessmentRepository } from "../modules/assessments/assessment.repository.js";
import { LocalTrackingRepository } from "../modules/tracking/tracking.repository.js";
import { LocalNutritionRepository } from "../modules/nutrition/nutrition.repository.js";
import { PasswordCodec } from "../shared/security/password-codec.js";
import { parseAccessToken } from "../shared/security/session-token.js";
import { createModuleRegistry, type ApplicationSummary } from "./module-registry.js";

export interface Application {
  describe(): ApplicationSummary;
  auth: ReturnType<typeof createAuthModule>["controller"];
  profile: ReturnType<typeof createProfileModule>["controller"];
  assessments: ReturnType<typeof createAssessmentModule>["controller"];
  tracking: ReturnType<typeof createTrackingModule>["controller"];
  nutrition: ReturnType<typeof createNutritionModule>["controller"];
  resolveRequestContext(authHeader: string | undefined, timezone?: string): Promise<RequestContext>;
}

export function createApplication(): Application {
  const config = createConfig();
  const registry = createModuleRegistry();
  const passwordCodec = new PasswordCodec();

  let auth: ReturnType<typeof createAuthModule>;
  let profile: ReturnType<typeof createProfileModule>;
  let assessments: ReturnType<typeof createAssessmentModule>;
  let tracking: ReturnType<typeof createTrackingModule>;
  let nutrition: ReturnType<typeof createNutritionModule>;

  if (config.databaseUrl) {
    console.log("[app] Using PostgreSQL persistence.");
    const pool = getPool(config.databaseUrl);
    auth       = createAuthModule(new PgAuthRepository(pool, passwordCodec, config.jwtSecret));
    profile    = createProfileModule(new PgProfileRepository(pool));
    assessments= createAssessmentModule(new PgAssessmentRepository(pool));
    tracking   = createTrackingModule(new PgTrackingRepository(pool));
    nutrition  = createNutritionModule(new PgNutritionRepository(pool));
  } else {
    console.log("[app] DATABASE_URL not set — using local JSON DevDataStore.");
    const store = new DevDataStore(new URL("../../.data/dev-storage.json", import.meta.url).pathname);
    auth       = createAuthModule(new LocalAuthRepository(store, passwordCodec, config.jwtSecret));
    profile    = createProfileModule(new LocalProfileRepository(store));
    assessments= createAssessmentModule(new LocalAssessmentRepository(store));
    tracking   = createTrackingModule(new LocalTrackingRepository(store));
    nutrition  = createNutritionModule(new LocalNutritionRepository(store));
  }

  return {
    auth: auth.controller,
    profile: profile.controller,
    assessments: assessments.controller,
    tracking: tracking.controller,
    nutrition: nutrition.controller,

    async resolveRequestContext(authHeader: string | undefined, timezone = "Asia/Shanghai") {
      const rawToken = authHeader?.replace(/^Bearer\s+/i, "").trim();
      if (!rawToken) throw new Error("Unauthorized: missing bearer token.");

      const parsed = parseAccessToken(rawToken, config.jwtSecret);
      if (!parsed) throw new Error("Unauthorized: invalid bearer token.");

      const user = await auth.repository.getUserById(parsed.userId);
      if (!user) throw new Error("Unauthorized: user not found.");

      return { user, timezone };
    },

    describe() {
      return {
        environment: config.nodeEnv,
        modules: registry.list(),
      };
    },
  };
}
