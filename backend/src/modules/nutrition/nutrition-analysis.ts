import type { FoodNutritionSnapshot } from "../../shared/core-types.js";
import type { PlanRuntime } from "../assessments/assessment.contract.js";
import type {
  DailyFoodEntryView,
} from "../tracking/tracking.contract.js";
import type {
  GapRecommendationView,
  NutritionAnalysisResult,
  NutritionCardView,
  NutritionSnapshot,
} from "./nutrition.contract.js";
import { FOOD_CATALOG, getFoodById, getFoodUnit, type FoodCatalogItem } from "./nutrition-catalog.js";

const DAILY_MICRO_TARGETS: Record<string, number> = {
  calcium: 800,
  potassium: 2000,
  magnesium: 330,
  iron: 15,
  sodium: 2000,
  vitaminC: 100,
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function resolveBaseAmount(food: FoodCatalogItem, unitKey: string, amount: number): number {
  const unit = getFoodUnit(food, unitKey) ?? getFoodUnit(food, food.defaultUnit);
  if (!unit) return amount;
  return round1(amount * unit.metricAmount);
}

export function calculateFoodNutrition(food: FoodCatalogItem, baseAmount: number): FoodNutritionSnapshot {
  const factor = baseAmount / 100;
  const micronutrients = Object.fromEntries(
    Object.entries(food.micronutrients).map(([key, value]) => [key, round1(value * factor)])
  );

  return {
    calories: round1(food.nutritionPer100.calories * factor),
    protein: round1(food.nutritionPer100.protein * factor),
    fat: round1(food.nutritionPer100.fat * factor),
    carbs: round1(food.nutritionPer100.carbs * factor),
    fiber: round1(food.nutritionPer100.fiber * factor),
    micronutrients,
  };
}

export function aggregateNutrition(entries: DailyFoodEntryView[]): NutritionSnapshot {
  const total: NutritionSnapshot = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    micronutrients: {},
    nutritionScore: 0,
  };

  entries.forEach((item) => {
    total.calories += item.calories;
    total.protein += item.protein;
    total.fat += item.fat;
    total.carbs += item.carbs;
    total.fiber += item.fiber;

    Object.entries(item.micronutrients).forEach(([key, value]) => {
      total.micronutrients[key] = round1((total.micronutrients[key] ?? 0) + value);
    });
  });

  total.calories = round1(total.calories);
  total.protein = round1(total.protein);
  total.fat = round1(total.fat);
  total.carbs = round1(total.carbs);
  total.fiber = round1(total.fiber);

  return total;
}

function buildMacroCards(
  nutrition: NutritionSnapshot,
  targets: { calories: number; protein: number; fat: number; carbs: number; fiber: number }
): NutritionCardView[] {
  const items: Array<[string, number, number, string]> = [
    ["热量", nutrition.calories, targets.calories, "kcal"],
    ["蛋白质", nutrition.protein, targets.protein, "g"],
    ["脂肪", nutrition.fat, targets.fat, "g"],
    ["碳水", nutrition.carbs, targets.carbs, "g"],
    ["膳食纤维", nutrition.fiber, targets.fiber, "g"],
  ];

  return items.map(([label, actual, target, unit]) => ({
    label,
    actual: `${round1(actual)}${unit}`,
    target: `目标 ${round1(target)}${unit}`,
    state: actual > target * 1.08 ? "偏高" : actual < target * 0.82 ? "偏低" : "贴近目标",
  }));
}

function buildMicronutrientCards(nutrition: NutritionSnapshot): NutritionCardView[] {
  return Object.entries(DAILY_MICRO_TARGETS).map(([key, target]) => {
    const actual = nutrition.micronutrients[key] ?? 0;
    return {
      label: key,
      actual: `${round1(actual)}`,
      target: `参考 ${target}`,
      state: actual >= target * 0.8 ? "覆盖较好" : actual >= target * 0.5 ? "还可提高" : "偏低",
    };
  });
}

function buildWarnings(nutrition: NutritionSnapshot, targets: { calories: number; fat: number; carbs: number }): string[] {
  const warnings: string[] = [];
  if (nutrition.calories > targets.calories + 120) warnings.push("当日热量已明显超出目标。");
  if (nutrition.fat > targets.fat + 8) warnings.push("当日脂肪偏高，后续加餐尽量减少高脂食物。");
  if (nutrition.carbs > targets.carbs + 20) warnings.push("当日碳水偏高，后续更适合优先补蛋白或纤维。");
  return warnings;
}

function buildGapRecommendations(
  nutrition: NutritionSnapshot,
  targets: { calories: number; protein: number; fat: number; carbs: number; fiber: number }
): GapRecommendationView[] {
  const calciumTarget = DAILY_MICRO_TARGETS["calcium"] ?? 800;
  const needProtein = nutrition.protein < targets.protein * 0.85;
  const needFiber = nutrition.fiber < targets.fiber * 0.8;
  const needCalcium = (nutrition.micronutrients.calcium ?? 0) < calciumTarget * 0.7;

  return FOOD_CATALOG.map((food) => {
    const baseAmount = food.defaultUnit === "piece" ? 1 : food.measureBase === "ml" ? 250 : 100;
    const normalizedBaseAmount = resolveBaseAmount(food, food.defaultUnit, baseAmount);
    const serving = calculateFoodNutrition(food, normalizedBaseAmount);
    const reasons: string[] = [];

    if (needProtein && serving.protein >= 8) reasons.push(`补蛋白 ${serving.protein}g`);
    if (needFiber && serving.fiber >= 3) reasons.push(`补纤维 ${serving.fiber}g`);
    if (needCalcium && (serving.micronutrients.calcium ?? 0) >= 100) reasons.push(`补钙 ${serving.micronutrients.calcium}mg`);

    return reasons.length
      ? {
          foodId: food.id,
          foodName: food.name,
          amountText: `${baseAmount}${getFoodUnit(food, food.defaultUnit)?.label ?? food.defaultUnit}`,
          calories: serving.calories,
          protein: serving.protein,
          fat: serving.fat,
          carbs: serving.carbs,
          fiber: serving.fiber,
          reasons,
          warnings: serving.fat > 10 ? ["脂肪不低，请结合当日总量控制"] : [],
        }
      : null;
  })
    .filter((item): item is GapRecommendationView => Boolean(item))
    .slice(0, 3);
}

export function buildNutritionAnalysis(
  entries: DailyFoodEntryView[],
  activePlan?: PlanRuntime,
  targetCalories = 1800
): NutritionAnalysisResult {
  const nutrition = aggregateNutrition(entries);
  const plan = activePlan ?? {
    code: "balanced-deficit",
    name: "均衡热量缺口",
    version: "v1",
    summary: "默认平衡减脂策略",
    executionScore: 82,
    mealRhythm: "三餐 + 一次加餐",
  };

  const targets = {
    calories: targetCalories,
    protein: plan.code === "high-protein" ? 145 : 125,
    fat: plan.code === "mediterranean" ? 65 : 55,
    carbs: plan.code === "high-protein" ? 160 : 185,
    fiber: 28,
  };

  const macroCards = buildMacroCards(nutrition, targets);
  const micronutrientCards = buildMicronutrientCards(nutrition);
  const overLimitWarnings = buildWarnings(nutrition, targets);
  const gapRecommendations = buildGapRecommendations(nutrition, targets);

  const targetHitCount = macroCards.filter((item) => item.state === "贴近目标").length;
  nutrition.nutritionScore = Math.round((targetHitCount / macroCards.length) * 100);

  return {
    algorithmVersion: "dev-0.3.0",
    activePlan: plan,
    nutrition,
    macroCards,
    micronutrientCards,
    overLimitWarnings,
    gapRecommendations,
  };
}

export function buildFoodEntryView(foodId: string, unitKey: string, amount: number, mealSlot: string) {
  const food = getFoodById(foodId);
  if (!food) {
    throw new Error(`Unknown foodId: ${foodId}`);
  }

  const baseAmount = resolveBaseAmount(food, unitKey, amount);
  const nutrition = calculateFoodNutrition(food, baseAmount);

  return {
    id: "",
    foodId: food.id,
    foodName: food.name,
    mealSlot,
    unitKey,
    amount,
    baseAmount,
    calories: nutrition.calories,
    protein: nutrition.protein,
    fat: nutrition.fat,
    carbs: nutrition.carbs,
    fiber: nutrition.fiber,
    micronutrients: nutrition.micronutrients,
  };
}
