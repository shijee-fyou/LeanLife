import { randomUUID } from "node:crypto";
import type { RequestContext } from "../../shared/core-types.js";
import { DevDataStore } from "../../shared/persistence/dev-data-store.js";
import type { RepositoryHealth } from "../../shared/persistence/repository.types.js";
import type { AddFoodEntryRequest, FoodCatalogItemView, FoodEntryWriteResult, NutritionAnalysisResult } from "./nutrition.contract.js";
import { getFoodById, FOOD_CATALOG } from "./nutrition-catalog.js";
import { buildFoodEntryView, buildNutritionAnalysis } from "./nutrition-analysis.js";

export interface NutritionRepository {
  listFoodCatalog(ctx: RequestContext): Promise<FoodCatalogItemView[]>;
  addFoodEntry(ctx: RequestContext, logDate: string, input: AddFoodEntryRequest): Promise<FoodEntryWriteResult>;
  getNutritionAnalysis(ctx: RequestContext, logDate: string): Promise<NutritionAnalysisResult>;
  health(): Promise<RepositoryHealth>;
}

export class LocalNutritionRepository implements NutritionRepository {
  constructor(private readonly store: DevDataStore) {}

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
    const entryId = randomUUID();
    const now = new Date().toISOString();

    await this.store.mutate((snapshot) => ({
      ...snapshot,
      foodEntries: [
        ...snapshot.foodEntries,
        {
          ...entry,
          id: entryId,
          userId: ctx.user.id,
          logDate,
          createdAt: now,
        },
      ],
    }));

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
    const snapshot = await this.store.read();
    const entries = snapshot.foodEntries
      .filter((item) => item.userId === ctx.user.id && item.logDate === logDate)
      .map((item) => ({
        id: item.id,
        foodId: item.foodId,
        foodName: item.foodName,
        mealSlot: item.mealSlot,
        unitKey: item.unitKey,
        amount: item.amount,
        baseAmount: item.baseAmount,
        calories: item.calories,
        protein: item.protein,
        fat: item.fat,
        carbs: item.carbs,
        fiber: item.fiber,
        micronutrients: item.micronutrients,
      }));
    const dailyLog = snapshot.dailyLogs.find((item) => item.userId === ctx.user.id && item.logDate === logDate);
    const assessment =
      (dailyLog?.assessmentId && snapshot.assessments.find((item) => item.id === dailyLog.assessmentId)) ||
      snapshot.assessments
        .filter((item) => item.userId === ctx.user.id)
        .sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))[0];

    return buildNutritionAnalysis(entries, assessment?.recommendedPlan, assessment?.targetCalories);
  }

  async health(): Promise<RepositoryHealth> {
    await this.store.read();
    return { name: "nutrition-repository", ready: true };
  }
}
