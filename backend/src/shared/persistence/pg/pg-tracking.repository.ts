import pg from "pg";
import type { RequestContext, TrendPoint } from "../../core-types.js";
import type { RepositoryHealth } from "../repository.types.js";
import type { TrackingRepository } from "../../../modules/tracking/tracking.repository.js";
import type { CalendarDayStatus, CalendarMonthStatus, DailyLogDetail, TrendQuery, TrendResult, UpsertDailyLogRequest } from "../../../modules/tracking/tracking.contract.js";
import { buildNutritionAnalysis } from "../../../modules/nutrition/nutrition-analysis.js";

export class PgTrackingRepository implements TrackingRepository {
  constructor(private readonly pool: pg.Pool) {}

  async getDailyLog(ctx: RequestContext, logDate: string): Promise<DailyLogDetail> {
    const logRes = await this.pool.query<Record<string, unknown>>(
      `SELECT dl.id, dl.log_date, dl.active_plan_code, dl.active_plan_version, dl.assessment_id,
              dl.energy_score, dl.hunger_score, dl.adherence_score, dl.plan_match_score,
              bme.weight_kg, bme.waist_cm, bme.sleep_hours, bme.hydration_ml
       FROM daily_logs dl
       LEFT JOIN body_metric_entries bme ON bme.daily_log_id = dl.id
       WHERE dl.user_id = $1 AND dl.log_date = $2`,
      [ctx.user.id, logDate]
    );

    const log = logRes.rows[0];

    const assessmentRes = await this.pool.query<Record<string, unknown>>(
      `SELECT id, target_calories, target_protein_g, target_fat_g, target_carbs_g, target_fiber_g,
              algorithm_version, result_payload
       FROM body_assessments
       WHERE user_id = $1 ${log?.["assessment_id"] ? "AND id = $2 " : ""}
       ORDER BY assessment_date DESC LIMIT 1`,
      log?.["assessment_id"] ? [ctx.user.id, log["assessment_id"]] : [ctx.user.id]
    );

    const assessment = assessmentRes.rows[0];
    const assessmentPayload = assessment ? ((assessment["result_payload"] as Record<string, unknown>) ?? {}) : undefined;
    const activePlan = assessmentPayload?.["recommendedPlan"] as DailyLogDetail["activePlan"] | undefined;

    const foodRes = await this.pool.query<Record<string, unknown>>(
      `SELECT fe.id, fe.food_id, fe.food_name, fe.meal_slot, fe.unit_key,
              fe.amount, fe.base_amount, fe.calories, fe.protein_g, fe.fat_g,
              fe.carbs_g, fe.fiber_g, fe.micronutrients
       FROM food_entries fe
       JOIN daily_logs dl ON dl.id = fe.daily_log_id
       WHERE dl.user_id = $1 AND dl.log_date = $2`,
      [ctx.user.id, logDate]
    );

    const foods = foodRes.rows.map(rowToFoodEntry);
    const analysis = buildNutritionAnalysis(
      foods,
      activePlan,
      assessment ? Number(assessment["target_calories"]) : undefined
    );

    return {
      logDate,
      activePlan,
      energyScore: log?.["energy_score"] != null ? Number(log["energy_score"]) : undefined,
      hungerScore: log?.["hunger_score"] != null ? Number(log["hunger_score"]) : undefined,
      adherenceScore: log?.["adherence_score"] != null ? Number(log["adherence_score"]) : undefined,
      planMatchScore: log?.["plan_match_score"] != null ? Number(log["plan_match_score"]) : undefined,
      bodyMetrics: log
        ? {
            weightKg: log["weight_kg"] != null ? Number(log["weight_kg"]) : undefined,
            waistCm: log["waist_cm"] != null ? Number(log["waist_cm"]) : undefined,
            sleepHours: log["sleep_hours"] != null ? Number(log["sleep_hours"]) : undefined,
            hydrationMl: log["hydration_ml"] != null ? Number(log["hydration_ml"]) : undefined,
          }
        : undefined,
      foods,
      nutrition: analysis.nutrition,
      analysis,
    };
  }

  async upsertDailyLog(ctx: RequestContext, logDate: string, input: UpsertDailyLogRequest): Promise<DailyLogDetail> {
    const logRes = await this.pool.query<{ id: string }>(
      `INSERT INTO daily_logs
         (id, user_id, log_date, timezone, active_plan_code, active_plan_version,
          assessment_id, energy_score, hunger_score, adherence_score, plan_match_score, notes)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5,
         (SELECT id FROM body_assessments WHERE id::text = $6 AND user_id = $1 LIMIT 1),
         $7, $8, $9, $10, $11)
       ON CONFLICT (user_id, log_date) DO UPDATE SET
         active_plan_code   = COALESCE($4,  daily_logs.active_plan_code),
         active_plan_version= COALESCE($5,  daily_logs.active_plan_version),
         assessment_id      = COALESCE(
           (SELECT id FROM body_assessments WHERE id::text = $6 AND user_id = $1 LIMIT 1),
           daily_logs.assessment_id),
         energy_score       = COALESCE($7,  daily_logs.energy_score),
         hunger_score       = COALESCE($8,  daily_logs.hunger_score),
         adherence_score    = COALESCE($9,  daily_logs.adherence_score),
         plan_match_score   = COALESCE($10, daily_logs.plan_match_score),
         notes              = COALESCE($11, daily_logs.notes),
         updated_at         = now()
       RETURNING id`,
      [
        ctx.user.id,
        logDate,
        ctx.timezone,
        input.activePlanCode ?? null,
        input.activePlanVersion ?? null,
        input.assessmentId ?? null,
        input.energyScore ?? null,
        input.hungerScore ?? null,
        input.adherenceScore ?? null,
        input.planMatchScore ?? null,
        input.note ?? null,
      ]
    );

    const logId = logRes.rows[0]?.id;
    if (!logId) throw new Error("Failed to upsert daily log.");

    if (input.bodyMetrics) {
      const bm = input.bodyMetrics;
      await this.pool.query(
        `INSERT INTO body_metric_entries (id, daily_log_id, weight_kg, waist_cm, sleep_hours, hydration_ml)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
         ON CONFLICT (daily_log_id) DO UPDATE SET
           weight_kg    = COALESCE($2, body_metric_entries.weight_kg),
           waist_cm     = COALESCE($3, body_metric_entries.waist_cm),
           sleep_hours  = COALESCE($4, body_metric_entries.sleep_hours),
           hydration_ml = COALESCE($5, body_metric_entries.hydration_ml),
           updated_at   = now()`,
        [logId, bm.weightKg ?? null, bm.waistCm ?? null, bm.sleepHours ?? null, bm.hydrationMl ?? null]
      );
    }

    return this.getDailyLog(ctx, logDate);
  }

  async getTrend(ctx: RequestContext, query: TrendQuery): Promise<TrendResult> {
    const rangeDays = query.rangeDays ?? 28;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays + 1);
    const startStr = startDate.toISOString().slice(0, 10);

    const res = await this.pool.query<Record<string, unknown>>(
      `SELECT dl.log_date, bme.weight_kg, bme.waist_cm, dl.energy_score, dl.hunger_score
       FROM daily_logs dl
       LEFT JOIN body_metric_entries bme ON bme.daily_log_id = dl.id
       WHERE dl.user_id = $1 AND dl.log_date >= $2
       ORDER BY dl.log_date ASC`,
      [ctx.user.id, startStr]
    );

    const points: TrendPoint[] = res.rows
      .map((row) => {
        let value: number | undefined;
        if (query.metric === "weight") value = row["weight_kg"] != null ? Number(row["weight_kg"]) : undefined;
        else if (query.metric === "waist") value = row["waist_cm"] != null ? Number(row["waist_cm"]) : undefined;
        else if (query.metric === "energy") value = row["energy_score"] != null ? Number(row["energy_score"]) : undefined;
        else if (query.metric === "hunger") value = row["hunger_score"] != null ? Number(row["hunger_score"]) : undefined;

        if (value == null) return null;
        const logDate = row["log_date"];
        const date = logDate instanceof Date ? logDate.toISOString().slice(0, 10) : (logDate as string);
        return { date, value };
      })
      .filter((p): p is TrendPoint => p !== null);

    const rollingWeeklyAverage =
      query.metric === "weight" && points.length ? computeRolling(points) : undefined;

    return { metric: query.metric, rangeDays, points, rollingWeeklyAverage };
  }

  async getCalendarMonthStatus(ctx: RequestContext, year: number, month: number): Promise<CalendarMonthStatus> {
    const mm = String(month).padStart(2, "0");
    const startDate = `${year}-${mm}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10); // last day of month

    // Target calories from the most recent assessment
    const asmRes = await this.pool.query<{ target_calories: string }>(
      `SELECT target_calories FROM body_assessments WHERE user_id = $1 ORDER BY assessment_date DESC LIMIT 1`,
      [ctx.user.id]
    );
    const targetCalories = asmRes.rows[0] ? Number(asmRes.rows[0].target_calories) : null;

    // Per-day summary for the requested month
    const monthRes = await this.pool.query<Record<string, unknown>>(
      `SELECT
         dl.log_date::text                       AS log_date,
         (bme.weight_kg IS NOT NULL)             AS has_weight,
         COUNT(fe.id)::int                       AS food_count,
         COALESCE(SUM(fe.calories), 0)::numeric  AS total_calories,
         dl.adherence_score,
         dl.energy_score
       FROM daily_logs dl
       LEFT JOIN body_metric_entries bme ON bme.daily_log_id = dl.id
       LEFT JOIN food_entries         fe  ON fe.daily_log_id  = dl.id
       WHERE dl.user_id  = $1
         AND dl.log_date BETWEEN $2 AND $3
       GROUP BY dl.log_date, bme.weight_kg, dl.adherence_score, dl.energy_score
       ORDER BY dl.log_date ASC`,
      [ctx.user.id, startDate, endDate]
    );

    const days: CalendarDayStatus[] = monthRes.rows.map((row) => {
      const totalCalories = Number(row["total_calories"]);
      const caloriesPct =
        targetCalories && totalCalories > 0
          ? Math.round((totalCalories / targetCalories) * 100)
          : null;
      return {
        date: row["log_date"] as string,
        hasWeight: row["has_weight"] as boolean,
        foodCount: Number(row["food_count"]),
        totalCalories,
        caloriesPct,
        adherenceScore: row["adherence_score"] != null ? Number(row["adherence_score"]) : null,
        energyScore: row["energy_score"] != null ? Number(row["energy_score"]) : null,
      };
    });

    // Streak: fetch all logged days in the last 90 days (any weight OR food entry)
    const streakRes = await this.pool.query<{ log_date: string }>(
      `SELECT dl.log_date::text AS log_date
       FROM daily_logs dl
       LEFT JOIN body_metric_entries bme ON bme.daily_log_id = dl.id
       LEFT JOIN food_entries         fe  ON fe.daily_log_id  = dl.id
       WHERE dl.user_id  = $1
         AND dl.log_date >= (CURRENT_DATE - INTERVAL '90 days')::text
         AND dl.log_date <= CURRENT_DATE::text
       GROUP BY dl.log_date
       HAVING bme.weight_kg IS NOT NULL OR COUNT(fe.id) > 0
       ORDER BY dl.log_date DESC`,
      [ctx.user.id]
    );

    const loggedSet = new Set(streakRes.rows.map((r) => r.log_date));
    const todayDate = new Date().toISOString().slice(0, 10);

    // Current streak: walk backwards from today (allow today to be still in progress)
    let currentStreak = 0;
    const cursor = new Date();
    if (!loggedSet.has(todayDate)) cursor.setDate(cursor.getDate() - 1);
    for (let i = 0; i < 90; i++) {
      const ds = cursor.toISOString().slice(0, 10);
      if (loggedSet.has(ds)) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak within the 90-day window
    const sortedDates = streakRes.rows.map((r) => r.log_date).sort();
    let longestStreak = 0;
    let run = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        run = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]!);
        const curr = new Date(sortedDates[i]!);
        const gap = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
        run = gap === 1 ? run + 1 : 1;
      }
      if (run > longestStreak) longestStreak = run;
    }

    const loggedDays = days.filter((d) => d.hasWeight || d.foodCount > 0).length;
    return { year, month, days, currentStreak, longestStreak, loggedDays };
  }

  async health(): Promise<RepositoryHealth> {
    await this.pool.query("SELECT 1");
    return { name: "tracking-repository", ready: true };
  }
}

function computeRolling(points: TrendPoint[]): TrendPoint[] {
  return points.map((p, i) => {
    const start = Math.max(0, i - 6);
    const window = points.slice(start, i + 1).map((x) => x.value);
    const avg = window.reduce((s, v) => s + v, 0) / window.length;
    return { date: p.date, value: Number(avg.toFixed(2)) };
  });
}

type FoodRow = Record<string, unknown>;

function rowToFoodEntry(row: FoodRow) {
  return {
    id: row["id"] as string,
    foodId: row["food_id"] as string,
    foodName: row["food_name"] as string,
    mealSlot: row["meal_slot"] as string,
    unitKey: row["unit_key"] as string,
    amount: Number(row["amount"]),
    baseAmount: Number(row["base_amount"]),
    calories: Number(row["calories"]),
    protein: Number(row["protein_g"]),
    fat: Number(row["fat_g"]),
    carbs: Number(row["carbs_g"]),
    fiber: Number(row["fiber_g"]),
    micronutrients: (row["micronutrients"] as Record<string, number>) ?? {},
  };
}
