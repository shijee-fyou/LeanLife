import type { ApiEnvelope, ISODate, RequestContext, Timezone, UUID } from "../../shared/core-types.js";

/**
 * Profile 模块只负责用户静态资料与习惯信息。
 * 任何会改变热量与宏量结果的计算，必须交给 assessments 模块。
 */

export interface UserProfile {
  id: UUID;
  userId: UUID;
  displayName?: string;
  sex?: string;
  birthDate?: ISODate;
  heightCm?: number;
  goalType: "fat_loss";
  activityLevel?: string;
  trainingDaysPerWeek?: number;
  timezone: Timezone;
  lifestylePayload: Record<string, unknown>;
}

export interface UpsertProfileRequest {
  displayName?: string;
  sex?: string;
  birthDate?: ISODate;
  heightCm?: number;
  activityLevel?: string;
  trainingDaysPerWeek?: number;
  timezone?: Timezone;
  lifestylePayload?: Record<string, unknown>;
}

export interface ProfileModule {
  getCurrentProfile(ctx: RequestContext): Promise<ApiEnvelope<UserProfile>>;
  upsertProfile(ctx: RequestContext, input: UpsertProfileRequest): Promise<ApiEnvelope<UserProfile>>;
}
