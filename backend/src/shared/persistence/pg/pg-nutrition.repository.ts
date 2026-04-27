import { randomUUID } from "node:crypto";
import pg from "pg";
import type { RequestContext } from "../../core-types.js";
import type { RepositoryHealth } from "../repository.types.js";
import type { NutritionRepository } from "../../../modules/nutrition/nutrition.repository.js";
import type { AddFoodEntryRequest, FoodCatalogItemView, FoodEntryWriteResult, NutritionAnalysisResult } from "../../../modules/nutrition/nutrition.contract.js";
import { FOOD_CATALOG, getFoodById } from "../../../modules/nutrition/nutrition-catalog.js";
import { buildFoodEntryView, buildNutritionAnalysis } from "../../../modules/nutrition/nutrition-analysis.js";

export class PgNutritionRepository implements NutritionRepository {
  constructor(private readonly pool: pg.Pool) {}

  async listFoodCatalog(_ctx: RequestContext): Promise<FoodCatalogItemView[]> {
    return FOOD_CATALOG.map((food) => ({
      id: food.id,
      name: food.name,
      category: food.category,
      measureBase: food.measureBase,
      defaultUnit: food.defaultUnit,
      unitOptions: food.unitOptions,
      nutritionPer100: food.nutritionPer100,
    }));
  }

  async addFoodEntry(ctx: RequestContext, logDate: string, input: AddFoodEntryRequest): Promise<FoodEntryWriteResult> {
    const entry = buildFoodEntryView(input.foodId, input.unitKey, input.amount, input.mealSlot);

    // Ensure daily_log exists
    const logRes = await this.pool.query<{ id: string }>(
      `INSERT INTO daily_logs (id, user_id, log_date, timezone)
       VALUES (gen_random_uuid(), $1, $2, $3)
       ON CONFLICT (user_id, log_date) DO UPDATE SET updated_at = now()
       RETURNING id`,
      [ctx.user.id, logDate, ctx.timezone]
    );
    const logId = logRes.rows[0]?.id;
    if (!logId) throw new Error("Failed to resolve daily log for food entry.");

    const entryId = randomUUID();
    await this.pool.query(
      `INSERT INTO food_entries
         (id, daily_log_id, food_id, food_name, meal_slot, unit_key,
          amount, base_amount, calories, protein_g, fat_g, carbs_g, fiber_g, micronutrients)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)`,
      [
        entryId,
        logId,
        entry.foodId,
        entry.foodName,
        entry.mealSlot,
        entry.unitKey,
        entry.amount,
        entry.baseAmount,
        entry.calories,
        entry.protein,
        entry.fat,
        entry.carbs,
        entry.fiber,
        JSON.stringify(entry.micronutrients),
      ]
    );

    const analysis = await this.getNutritionAnalysis(ctx, logDate);
    return {
      foodEntryId: entryId,
      logDate,
      nutrition: {
        calories: entry.calories,
        protein: entry.protein,
        fat: entry.fat,
        carbs: entry.carbs,
        fiber: entry.fiber,
        micronutrients: entry.micronutrients,
      },
      analysis,
    };
  }

  async getNutritionAnalysis(ctx: RequestContext, logDate: string): Promise<NutritionAnalysisResult> {
    const foodRes = await this.pool.query<Record<string, unknown>>(
      `SELECT fe.id, fe.food_id, fe.food_name, fe.meal_slot, fe.unit_key,
              fe.amount, fe.base_amount, fe.calories, fe.protein_g, fe.fat_g,
              fe.carbs_g, fe.fiber_g, fe.micronutrients
       FROM food_entries fe
       JOIN daily_logs dl ON dl.id = fe.daily_log_id
       WHERE dl.user_id = $1 AND dl.log_date = $2`,
      [ctx.user.id, logDate]
    );

    const entries = foodRes.rows.map((row) => ({
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
    }));

    const assessmentRes = await this.pool.query<Record<string, unknown>>(
      `SELECT ba.target_calories, ba.result_payload
       FROM body_assessments ba
       JOIN daily_logs dl ON dl.user_id = ba.user_id
       WHERE dl.user_id = $1 AND dl.log_date = $2
       ORDER BY ba.assessment_date DESC
       LIMIT 1`,
      [ctx.user.id, logDate]
    );

    const assessmentRow = assessmentRes.rows[0];
    const payload = assessmentRow?.["result_payload"] as Record<string, unknown> | undefined;
    const activePlan = payload?.["recommendedPlan"] as Parameters<typeof buildNutritionAnalysis>[1];

    return buildNutritionAnalysis(
      entries,
      activePlan,
      assessmentRow ? Number(assessmentRow["target_calories"]) : undefined
    );
  }

  async health(): Promise<RepositoryHealth> {
    await this.pool.query("SELECT 1");
    return { name: "nutrition-repository", ready: true };
  }
}
