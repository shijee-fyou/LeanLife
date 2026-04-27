import type { AssessmentSnapshot, AuthSession, DailyLogDetail, UserProfile } from "./types";

export const demoSession: AuthSession = {
  accessToken: "demo-access",
  refreshToken: "demo-refresh",
  user: {
    id: "demo-user-id",
    email: "demo@leanlife.local",
    role: "user",
  },
};

export const demoProfile: UserProfile = {
  id: "demo-profile-id",
  userId: "demo-user-id",
  displayName: "LeanLife Demo",
  heightCm: 172,
  activityLevel: "moderate",
  trainingDaysPerWeek: 4,
  timezone: "Asia/Shanghai",
  lifestylePayload: {
    sleep: "regular",
    workStyle: "office",
  },
};

export const demoAssessment: AssessmentSnapshot = {
  id: "demo-assessment-id",
  assessmentDate: "2026-04-21",
  targetCalories: 2200,
  targets: {
    protein: 144,
    fat: 68,
    carbs: 183,
    fiber: 30,
  },
  recommendedPlan: {
    code: "high-protein",
    name: "高蛋白减脂",
    version: "v1",
    summary: "优先保证蛋白与恢复质量。",
    executionScore: 88,
    mealRhythm: "三餐 + 高蛋白加餐",
  },
  algorithmVersion: "dev-0.3.0",
  resultPayload: {
    estimatedBmr: 1733,
    estimatedTdee: 2580,
  },
};

export const demoDailyLog: DailyLogDetail = {
  logDate: "2026-04-21",
  activePlan: demoAssessment.recommendedPlan,
  bodyMetrics: {
    weightKg: 76,
    waistCm: 86,
    hydrationMl: 2100,
  },
  foods: [
    {
      id: "food-entry-1",
      foodId: "oats",
      foodName: "燕麦片",
      mealSlot: "breakfast",
      unitKey: "g",
      amount: 80,
      baseAmount: 80,
      calories: 311.2,
      protein: 13.5,
      fat: 5.5,
      carbs: 53,
      fiber: 8.5,
      micronutrients: {
        calcium: 43.2,
        iron: 3.8,
        magnesium: 141.6,
        potassium: 343.2,
      },
    },
  ],
  nutrition: {
    calories: 311.2,
    protein: 13.5,
    fat: 5.5,
    carbs: 53,
    fiber: 8.5,
    micronutrients: {
      calcium: 43.2,
      iron: 3.8,
      magnesium: 141.6,
      potassium: 343.2,
    },
    nutritionScore: 0,
  },
  analysis: {
    algorithmVersion: "dev-0.3.0",
    overLimitWarnings: [],
    gapRecommendations: [
      {
        foodId: "milk",
        foodName: "低脂牛奶",
        amountText: "250毫升",
        calories: 115,
        protein: 8.5,
        fat: 3.8,
        carbs: 12,
        fiber: 0,
        reasons: ["补蛋白 8.5g", "补钙 300mg"],
        warnings: [],
      },
    ],
  },
};
