import type {
  ApiEnvelope,
  ISODate,
  RequestContext,
  TrendPoint,
  UUID,
} from "../../shared/core-types.js";
import type { PlanRuntime } from "../assessments/assessment.contract.js";
import type { NutritionAnalysisResult, NutritionSnapshot } from "../nutrition/nutrition.contract.js";

/**
 * Tracking 模块负责日级记录和趋势，不直接关心食物库内部细节。
 * 需要营养汇总时，通过 nutrition 模块输出的快照结果拼装。
 */

export interface BodyMetricsInput {
  weightKg?: number;
  waistCm?: number;
  sleepHours?: number;
  hydrationMl?: number;
}

export interface UpsertDailyLogRequest {
  activePlanCode?: string;
  activePlanVersion?: string;
  assessmentId?: UUID;
  energyScore?: number;
  hungerScore?: number;
  adherenceScore?: number;
  planMatchScore?: number;
  note?: string;
  bodyMetrics?: BodyMetricsInput;
}

export interface DailyFoodEntryView {
  id: UUID;
  foodId: UUID;
  foodName: string;
  mealSlot: string;
  unitKey: string;
  amount: number;
  baseAmount: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  micronutrients: Record<string, number>;
}

export interface DailyLogDetail {
  logDate: ISODate;
  activePlan?: PlanRuntime;
  energyScore?: number;
  hungerScore?: number;
  adherenceScore?: number;
  planMatchScore?: number;
  bodyMetrics?: BodyMetricsInput;
  foods: DailyFoodEntryView[];
  nutrition?: NutritionSnapshot;
  analysis?: NutritionAnalysisResult;
}

export interface TrendQuery {
  metric: "weight" | "waist" | "energy" | "hunger";
  rangeDays?: number;
}

export interface TrendResult {
  metric: TrendQuery["metric"];
  rangeDays: number;
  points: TrendPoint[];
  rollingWeeklyAverage?: TrendPoint[];
}

export interface CalendarDayStatus {
  date: ISODate;
  hasWeight: boolean;
  foodCount: number;
  totalCalories: number;
  caloriesPct: number | null;
  adherenceScore: number | null;
  energyScore: number | null;
}

export interface CalendarMonthStatus {
  year: number;
  month: number;
  days: CalendarDayStatus[];
  currentStreak: number;
  longestStreak: number;
  loggedDays: number;
}

export interface TrackingModule {
  getDailyLog(ctx: RequestContext, logDate: ISODate): Promise<ApiEnvelope<DailyLogDetail>>;
  upsertDailyLog(ctx: RequestContext, logDate: ISODate, input: UpsertDailyLogRequest): Promise<ApiEnvelope<DailyLogDetail>>;
  getTrend(ctx: RequestContext, query: TrendQuery): Promise<ApiEnvelope<TrendResult>>;
  getCalendarMonthStatus(ctx: RequestContext, year: number, month: number): Promise<ApiEnvelope<CalendarMonthStatus>>;
}
