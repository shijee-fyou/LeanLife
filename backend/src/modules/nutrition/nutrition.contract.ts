import type {
  AlgorithmVersion,
  ApiEnvelope,
  FoodNutritionSnapshot,
  ISODate,
  MacroNutrition,
  RequestContext,
  UUID,
} from "../../shared/core-types.js";
import type { PlanRuntime } from "../assessments/assessment.contract.js";

/**
 * Nutrition 模块负责：
 * 1. 食物写入
 * 2. 单位换算
 * 3. 汇总营养
 * 4. 方案关联分析
 * 5. 缺口推荐
 *
 * 它不负责用户登录和静态档案维护。
 */

export interface AddFoodEntryRequest {
  foodId: UUID;
  mealSlot: "breakfast" | "lunch" | "dinner" | "snack" | "firstMeal" | "mainMeal" | "closeWindowSnack";
  unitKey: string;
  amount: number;
}

export interface NutritionSnapshot extends MacroNutrition {
  micronutrients: Record<string, number>;
  nutritionScore?: number;
}

export interface NutritionCardView {
  label: string;
  actual: string;
  target: string;
  state: string;
}

export interface FoodCatalogItemView {
  id: UUID;
  name: string;
  category: string;
  measureBase: "g" | "ml";
  defaultUnit: string;
  unitOptions: Array<{
    key: string;
    label: string;
    metricAmount: number;
  }>;
  nutritionPer100: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
}

export interface GapRecommendationView {
  foodId: UUID;
  foodName: string;
  amountText: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  reasons: string[];
  warnings: string[];
}

export interface NutritionAnalysisResult {
  algorithmVersion: AlgorithmVersion;
  activePlan: PlanRuntime;
  nutrition: NutritionSnapshot;
  macroCards: NutritionCardView[];
  micronutrientCards: NutritionCardView[];
  overLimitWarnings: string[];
  gapRecommendations: GapRecommendationView[];
}

export interface FoodEntryWriteResult {
  foodEntryId: UUID;
  logDate: ISODate;
  nutrition: FoodNutritionSnapshot;
  analysis: NutritionAnalysisResult;
}

export interface NutritionModule {
  listFoodCatalog(ctx: RequestContext): Promise<ApiEnvelope<FoodCatalogItemView[]>>;
  addFoodEntry(ctx: RequestContext, logDate: ISODate, input: AddFoodEntryRequest): Promise<ApiEnvelope<FoodEntryWriteResult>>;
  getNutritionAnalysis(ctx: RequestContext, logDate: ISODate): Promise<ApiEnvelope<NutritionAnalysisResult>>;
}
