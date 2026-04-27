import type { AlgorithmVersion, ApiEnvelope, ISODate, MacroTargets, RequestContext, UUID } from "../../shared/core-types.js";

/**
 * Assessments 模块负责“静态输入 -> 评估快照 -> 推荐方案”的链路。
 * 任何每日饮食写入都不应该直接改这里的数据。
 */

export interface AssessmentBodyInputs {
  weightKg?: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
  trainingDaysPerWeek?: number;
  bodyInputsPayload?: Record<string, unknown>;
}

export interface PlanRuntime {
  code: string;
  name: string;
  version: string;
  summary: string;
  executionScore: number;
  mealRhythm: string;
}

export interface CreateAssessmentRequest {
  assessmentDate: ISODate;
  bodyInputs: AssessmentBodyInputs;
  note?: string;
}

export interface AssessmentSnapshot {
  id: UUID;
  assessmentDate: ISODate;
  targetCalories: number;
  targets: MacroTargets;
  recommendedPlan: PlanRuntime;
  algorithmVersion: AlgorithmVersion;
  resultPayload: Record<string, unknown>;
}

export interface AssessmentModule {
  createAssessment(ctx: RequestContext, input: CreateAssessmentRequest): Promise<ApiEnvelope<AssessmentSnapshot>>;
  listAssessments(ctx: RequestContext): Promise<ApiEnvelope<AssessmentSnapshot[]>>;
}
