import { randomUUID } from "node:crypto";
import type { RequestContext, TrendPoint } from "../../shared/core-types.js";
import { DevDataStore } from "../../shared/persistence/dev-data-store.js";
import type { RepositoryHealth } from "../../shared/persistence/repository.types.js";
import type { DailyLogDetail, TrendQuery, TrendResult, UpsertDailyLogRequest } from "./tracking.contract.js";
import { buildNutritionAnalysis } from "../nutrition/nutrition-analysis.js";

export interface TrackingRepository {
  getDailyLog(ctx: RequestContext, logDate: string): Promise<DailyLogDetail>;
  upsertDailyLog(ctx: RequestContext, logDate: string, input: UpsertDailyLogRequest): Promise<DailyLogDetail>;
  getTrend(ctx: RequestContext, query: TrendQuery): Promise<TrendResult>;
  health(): Promise<RepositoryHealth>;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

function computeRollingWeeklyAverage(points: TrendPoint[]): TrendPoint[] {
  return points.map((point, index) => {
    const start = Math.max(0, index - 6);
    const window = points.slice(start, index + 1).map((item) => item.value);
    return {
      date: point.date,
      value: Number(average(window).toFixed(2)),
    };
  });
}

function resolveMetricValue(log: {
  bodyMetrics?: { weightKg?: number; waistCm?: number };
  energyScore?: number;
  hungerScore?: number;
}, metric: TrendQuery["metric"]): number | undefined {
  if (metric === "weight") return log.bodyMetrics?.weightKg;
  if (metric === "waist") return log.bodyMetrics?.waistCm;
  if (metric === "energy") return log.energyScore;
  if (metric === "hunger") return log.hungerScore;
  return undefined;
}

export class LocalTrackingRepository implements TrackingRepository {
  constructor(private readonly store: DevDataStore) {}

  async getDailyLog(ctx: RequestContext, logDate: string): Promise<DailyLogDetail> {
    const current = await this.store.read();
    const dailyLog = current.dailyLogs.find((item) => item.userId === ctx.user.id && item.logDate === logDate);
    const linkedAssessment =
      (dailyLog?.assessmentId && current.assessments.find((item) => item.id === dailyLog.assessmentId)) ||
      current.assessments
        .filter((item) => item.userId === ctx.user.id)
        .sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))[0];
    const foods = current.foodEntries
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
    const analysis = buildNutritionAnalysis(foods, linkedAssessment?.recommendedPlan, linkedAssessment?.targetCalories);

    return {
      logDate,
      activePlan: linkedAssessment?.recommendedPlan,
      bodyMetrics: dailyLog?.bodyMetrics,
      foods,
      nutrition: analysis.nutrition,
      analysis,
    };
  }

  async upsertDailyLog(ctx: RequestContext, logDate: string, input: UpsertDailyLogRequest): Promise<DailyLogDetail> {
    const now = new Date().toISOString();
    const current = await this.store.mutate((snapshot) => {
      const existing = snapshot.dailyLogs.find((item) => item.userId === ctx.user.id && item.logDate === logDate);

      if (!existing) {
        return {
          ...snapshot,
          dailyLogs: [
            ...snapshot.dailyLogs,
            {
              id: randomUUID(),
              userId: ctx.user.id,
              logDate,
              activePlanCode: input.activePlanCode,
              activePlanVersion: input.activePlanVersion,
              assessmentId: input.assessmentId,
              energyScore: input.energyScore,
              hungerScore: input.hungerScore,
              adherenceScore: input.adherenceScore,
              planMatchScore: input.planMatchScore,
              note: input.note,
              bodyMetrics: input.bodyMetrics,
              createdAt: now,
              updatedAt: now,
            },
          ],
        };
      }

      return {
        ...snapshot,
        dailyLogs: snapshot.dailyLogs.map((item) =>
          item.userId === ctx.user.id && item.logDate === logDate
            ? {
                ...item,
                activePlanCode: input.activePlanCode ?? item.activePlanCode,
                activePlanVersion: input.activePlanVersion ?? item.activePlanVersion,
                assessmentId: input.assessmentId ?? item.assessmentId,
                energyScore: input.energyScore ?? item.energyScore,
                hungerScore: input.hungerScore ?? item.hungerScore,
                adherenceScore: input.adherenceScore ?? item.adherenceScore,
                planMatchScore: input.planMatchScore ?? item.planMatchScore,
                note: input.note ?? item.note,
                bodyMetrics: input.bodyMetrics ?? item.bodyMetrics,
                updatedAt: now,
              }
            : item
        ),
      };
    });

    const dailyLog = current.dailyLogs.find((item) => item.userId === ctx.user.id && item.logDate === logDate);
    const linkedAssessment =
      (dailyLog?.assessmentId && current.assessments.find((item) => item.id === dailyLog.assessmentId)) ||
      current.assessments
        .filter((item) => item.userId === ctx.user.id)
        .sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))[0];
    const foods = current.foodEntries
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
    const analysis = buildNutritionAnalysis(foods, linkedAssessment?.recommendedPlan, linkedAssessment?.targetCalories);

    return {
      logDate,
      activePlan: linkedAssessment?.recommendedPlan,
      bodyMetrics: dailyLog?.bodyMetrics,
      foods,
      nutrition: analysis.nutrition,
      analysis,
    };
  }

  async getTrend(ctx: RequestContext, query: TrendQuery): Promise<TrendResult> {
    const current = await this.store.read();
    const rangeDays = query.rangeDays ?? 28;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - rangeDays + 1);

    const points = current.dailyLogs
      .filter((item) => item.userId === ctx.user.id && item.logDate >= start.toISOString().slice(0, 10))
      .sort((a, b) => a.logDate.localeCompare(b.logDate))
      .map((item) => {
        const value = resolveMetricValue(item, query.metric);
        return value === undefined
          ? null
          : {
              date: item.logDate,
              value,
            };
      })
      .filter((item): item is TrendPoint => Boolean(item));

    return {
      metric: query.metric,
      rangeDays,
      points,
      rollingWeeklyAverage: query.metric === "weight" && points.length ? computeRollingWeeklyAverage(points) : undefined,
    };
  }

  async health(): Promise<RepositoryHealth> {
    await this.store.read();
    return { name: "tracking-repository", ready: true };
  }
}
