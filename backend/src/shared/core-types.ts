/**
 * 共享基础类型。
 *
 * 设计目标：
 * 1. 让每个业务模块都使用同一套日期、ID、算法版本与响应包装。
 * 2. 后续不管切到 NestJS、FastAPI，还是 RPC，都能复用这层语义。
 */

export type UUID = string;
export type ISODate = string;
export type ISODateTime = string;
export type Timezone = string;
export type AlgorithmVersion = string;

export type UserRole = "user" | "coach" | "admin";
export type UserStatus = "active" | "paused" | "deleted";

export interface AuthenticatedUser {
  id: UUID;
  email: string;
  role: UserRole;
}

export interface RequestContext {
  user: AuthenticatedUser;
  timezone: Timezone;
  requestId?: string;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiMeta {
  requestId?: string;
  algorithmVersion?: AlgorithmVersion;
  generatedAt?: ISODateTime;
}

export interface ApiEnvelope<TData> {
  data: TData;
  meta?: ApiMeta;
}

export interface MacroTargets {
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export interface MacroNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export type MicronutrientMap = Record<string, number>;

export interface FoodNutritionSnapshot extends MacroNutrition {
  micronutrients: MicronutrientMap;
}

export interface TrendPoint {
  date: ISODate;
  value: number;
}
