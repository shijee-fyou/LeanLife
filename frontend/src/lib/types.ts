export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  sex?: string;
  birthDate?: string;
  heightCm?: number;
  activityLevel?: string;
  trainingDaysPerWeek?: number;
  timezone: string;
  lifestylePayload: Record<string, unknown>;
}

export interface AssessmentTargets {
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export interface PlanRuntime {
  code: string;
  name: string;
  version: string;
  summary: string;
  executionScore: number;
  mealRhythm: string;
}

export interface AssessmentSnapshot {
  id: string;
  assessmentDate: string;
  targetCalories: number;
  targets: AssessmentTargets;
  recommendedPlan: PlanRuntime;
  algorithmVersion: string;
  resultPayload: Record<string, unknown>;
}

export interface DailyLogDetail {
  logDate: string;
  activePlan?: PlanRuntime;
  energyScore?: number;
  hungerScore?: number;
  adherenceScore?: number;
  planMatchScore?: number;
  bodyMetrics?: {
    weightKg?: number;
    waistCm?: number;
    sleepHours?: number;
    hydrationMl?: number;
  };
  foods: Array<{
    id: string;
    foodId: string;
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
  }>;
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    micronutrients: Record<string, number>;
    nutritionScore?: number;
  };
  analysis?: {
    algorithmVersion: string;
    overLimitWarnings: string[];
    gapRecommendations: Array<{
      foodId: string;
      foodName: string;
      amountText: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      fiber: number;
      reasons: string[];
      warnings: string[];
    }>;
  };
}

export interface FoodCatalogItemView {
  id: string;
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

export interface WorkspaceData {
  session: AuthSession;
  profile: UserProfile;
  assessment: AssessmentSnapshot;
  dailyLog: DailyLogDetail;
  foods: FoodCatalogItemView[];
}

export interface ApiEnvelope<TData> {
  data: TData;
  meta?: {
    requestId?: string;
    algorithmVersion?: string;
    generatedAt?: string;
  };
}
