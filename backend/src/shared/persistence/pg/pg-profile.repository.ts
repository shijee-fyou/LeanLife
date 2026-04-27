import pg from "pg";
import type { RequestContext } from "../../core-types.js";
import type { RepositoryHealth } from "../repository.types.js";
import type { ProfileRepository } from "../../../modules/profile/profile.repository.js";
import type { UserProfile, UpsertProfileRequest } from "../../../modules/profile/profile.contract.js";

export class PgProfileRepository implements ProfileRepository {
  constructor(private readonly pool: pg.Pool) {}

  async getByUser(ctx: RequestContext): Promise<UserProfile> {
    const res = await this.pool.query<Record<string, unknown>>(
      `SELECT id, user_id, display_name, sex, birth_date, height_cm, goal_type,
              activity_level, training_days_per_week, timezone, lifestyle_payload
       FROM user_profiles WHERE user_id = $1`,
      [ctx.user.id]
    );
    const row = res.rows[0];
    if (!row) {
      return { id: "", userId: ctx.user.id, goalType: "fat_loss", timezone: ctx.timezone, lifestylePayload: {} };
    }
    return rowToProfile(row);
  }

  async upsertByUser(ctx: RequestContext, input: UpsertProfileRequest): Promise<UserProfile> {
    const res = await this.pool.query<Record<string, unknown>>(
      `INSERT INTO user_profiles
         (id, user_id, display_name, sex, birth_date, height_cm,
          activity_level, training_days_per_week, timezone, lifestyle_payload, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, now())
       ON CONFLICT (user_id) DO UPDATE SET
         display_name           = COALESCE($2,       user_profiles.display_name),
         sex                    = COALESCE($3,       user_profiles.sex),
         birth_date             = COALESCE($4::date, user_profiles.birth_date),
         height_cm              = COALESCE($5,       user_profiles.height_cm),
         activity_level         = COALESCE($6,       user_profiles.activity_level),
         training_days_per_week = COALESCE($7,       user_profiles.training_days_per_week),
         timezone               = COALESCE($8,       user_profiles.timezone),
         lifestyle_payload      = COALESCE($9::jsonb,user_profiles.lifestyle_payload),
         updated_at             = now()
       RETURNING id, user_id, display_name, sex, birth_date, height_cm, goal_type,
                 activity_level, training_days_per_week, timezone, lifestyle_payload`,
      [
        ctx.user.id,
        input.displayName ?? null,
        input.sex ?? null,
        input.birthDate ?? null,
        input.heightCm ?? null,
        input.activityLevel ?? null,
        input.trainingDaysPerWeek ?? null,
        input.timezone ?? null,
        input.lifestylePayload != null ? JSON.stringify(input.lifestylePayload) : null,
      ]
    );
    const row = res.rows[0];
    if (!row) throw new Error("Failed to upsert profile.");
    return rowToProfile(row);
  }

  async health(): Promise<RepositoryHealth> {
    await this.pool.query("SELECT 1");
    return { name: "profile-repository", ready: true };
  }
}

function rowToProfile(row: Record<string, unknown>): UserProfile {
  const birthDate = row["birth_date"];
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    displayName: (row["display_name"] as string | null) ?? undefined,
    sex: (row["sex"] as string | null) ?? undefined,
    birthDate: birthDate instanceof Date
      ? birthDate.toISOString().slice(0, 10)
      : typeof birthDate === "string" ? birthDate : undefined,
    heightCm: row["height_cm"] != null ? Number(row["height_cm"]) : undefined,
    goalType: "fat_loss",
    activityLevel: (row["activity_level"] as string | null) ?? undefined,
    trainingDaysPerWeek: row["training_days_per_week"] != null ? Number(row["training_days_per_week"]) : undefined,
    timezone: (row["timezone"] as string | null) ?? "Asia/Shanghai",
    lifestylePayload: (row["lifestyle_payload"] as Record<string, unknown> | null) ?? {},
  };
}
