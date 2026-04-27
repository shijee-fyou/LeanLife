import { randomUUID } from "node:crypto";
import pg from "pg";
import type { RequestContext } from "../../core-types.js";
import type { RepositoryHealth } from "../repository.types.js";
import type { AssessmentRepository } from "../../../modules/assessments/assessment.repository.js";
import type { AssessmentSnapshot, CreateAssessmentRequest } from "../../../modules/assessments/assessment.contract.js";
import type { UserProfile } from "../../../modules/profile/profile.contract.js";
import { computeAssessment } from "../../../modules/assessments/assessment-calculator.js";
import { AssessmentDependencyError } from "../../../modules/assessments/assessment.errors.js";

export class PgAssessmentRepository implements AssessmentRepository {
  constructor(private readonly pool: pg.Pool) {}

  async create(ctx: RequestContext, input: CreateAssessmentRequest): Promise<AssessmentSnapshot> {
    const profileRes = await this.pool.query<Record<string, unknown>>(
      `SELECT id, user_id, display_name, sex, birth_date, height_cm, goal_type,
              activity_level, training_days_per_week, timezone, lifestyle_payload
       FROM user_profiles WHERE user_id = $1`,
      [ctx.user.id]
    );

    const profileRow = profileRes.rows[0];
    const profile: UserProfile | null = profileRow
      ? {
          id: profileRow["id"] as string,
          userId: profileRow["user_id"] as string,
          displayName: (profileRow["display_name"] as string | null) ?? undefined,
          sex: (profileRow["sex"] as string | null) ?? undefined,
          heightCm: profileRow["height_cm"] != null ? Number(profileRow["height_cm"]) : undefined,
          goalType: "fat_loss",
          activityLevel: (profileRow["activity_level"] as string | null) ?? undefined,
          trainingDaysPerWeek:
            profileRow["training_days_per_week"] != null ? Number(profileRow["training_days_per_week"]) : undefined,
          timezone: (profileRow["timezone"] as string | null) ?? "Asia/Shanghai",
          lifestylePayload: (profileRow["lifestyle_payload"] as Record<string, unknown> | null) ?? {},
        }
      : null;

    if (!profile?.heightCm && !input.bodyInputs.bodyInputsPayload?.["heightCm"]) {
      throw new AssessmentDependencyError("Assessment requires at least one profile-based height input.");
    }

    const computed = computeAssessment(profile, input.bodyInputs);
    const id = randomUUID();

    const resultPayloadForDb = {
      ...computed.resultPayload,
      recommendedPlan: computed.recommendedPlan,
      note: input.note ?? null,
    };

    await this.pool.query(
      `INSERT INTO body_assessments
         (id, user_id, profile_id, assessment_date,
          target_calories, target_protein_g, target_fat_g, target_carbs_g, target_fiber_g,
          recommended_plan_code, algorithm_version, input_payload, result_payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb)`,
      [
        id,
        ctx.user.id,
        profile?.id || null,
        input.assessmentDate,
        computed.targetCalories,
        computed.targets.protein,
        computed.targets.fat,
        computed.targets.carbs,
        computed.targets.fiber,
        computed.recommendedPlan.code,
        "dev-0.2.0",
        JSON.stringify(input.bodyInputs),
        JSON.stringify(resultPayloadForDb),
      ]
    );

    return {
      id,
      assessmentDate: input.assessmentDate,
      targetCalories: computed.targetCalories,
      targets: computed.targets,
      recommendedPlan: computed.recommendedPlan,
      algorithmVersion: "dev-0.2.0",
      resultPayload: resultPayloadForDb,
    };
  }

  async list(ctx: RequestContext): Promise<AssessmentSnapshot[]> {
    const res = await this.pool.query<Record<string, unknown>>(
      `SELECT id, assessment_date, target_calories, target_protein_g, target_fat_g,
              target_carbs_g, target_fiber_g, algorithm_version, result_payload
       FROM body_assessments
       WHERE user_id = $1
       ORDER BY assessment_date DESC`,
      [ctx.user.id]
    );

    return res.rows.map((row) => {
      const payload = (row["result_payload"] as Record<string, unknown>) ?? {};
      return {
        id: row["id"] as string,
        assessmentDate: row["assessment_date"] instanceof Date
          ? (row["assessment_date"] as Date).toISOString().slice(0, 10)
          : (row["assessment_date"] as string),
        targetCalories: Number(row["target_calories"]),
        targets: {
          protein: Number(row["target_protein_g"]),
          fat: Number(row["target_fat_g"]),
          carbs: Number(row["target_carbs_g"]),
          fiber: Number(row["target_fiber_g"]),
        },
        recommendedPlan: payload["recommendedPlan"] as AssessmentSnapshot["recommendedPlan"],
        algorithmVersion: row["algorithm_version"] as string,
        resultPayload: payload,
      };
    });
  }

  async health(): Promise<RepositoryHealth> {
    await this.pool.query("SELECT 1");
    return { name: "assessment-repository", ready: true };
  }
}
