import type { MacroTargets } from "../../shared/core-types.js";
import type { UserProfile } from "../profile/profile.contract.js";
import type { AssessmentBodyInputs, PlanRuntime } from "./assessment.contract.js";

export interface AssessmentComputation {
  targetCalories: number;
  targets: MacroTargets;
  recommendedPlan: PlanRuntime;
  resultPayload: Record<string, unknown>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number): number {
  return Math.round(value);
}

function parseActivityMultiplier(activityLevel?: string): number {
  if (activityLevel === "low") return 1.35;
  if (activityLevel === "moderate") return 1.5;
  if (activityLevel === "high") return 1.7;
  return 1.42;
}

function inferAge(birthDate?: string): number | undefined {
  if (!birthDate) return undefined;
  const birthYear = Number(birthDate.slice(0, 4));
  if (!Number.isFinite(birthYear)) return undefined;
  return new Date().getFullYear() - birthYear;
}

function estimateBmr(weightKg: number, heightCm: number, age?: number, sex?: string): number {
  const safeAge = age ?? 30;
  const sexOffset = sex === "female" ? -161 : 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * safeAge + sexOffset;
}

function buildRecommendedPlan(inputs: {
  trainingDays: number;
  lifestylePayload: Record<string, unknown>;
  targetCalories: number;
}): PlanRuntime {
  const stressLevel = String(inputs.lifestylePayload.stress ?? "");
  const eatingWindow = String(inputs.lifestylePayload.eatingWindow ?? "");

  if (inputs.trainingDays >= 4) {
    return {
      code: "high-protein",
      name: "高蛋白减脂",
      version: "v1",
      summary: "优先保证蛋白充足和恢复质量，适合训练频率较高用户。",
      executionScore: 88,
      mealRhythm: "三餐 + 高蛋白加餐",
    };
  }

  if (eatingWindow === "16:8") {
    return {
      code: "if",
      name: "轻断食（16:8）",
      version: "v1",
      summary: "通过固定进食窗口简化执行，适合节奏明确的工作日。",
      executionScore: 82,
      mealRhythm: "首餐 + 主餐 + 收窗加餐",
    };
  }

  if (stressLevel === "high" || inputs.targetCalories < 1550) {
    return {
      code: "balanced-deficit",
      name: "均衡热量缺口",
      version: "v1",
      summary: "优先稳住热量缺口和依从性，适合作为轻商用默认策略。",
      executionScore: 85,
      mealRhythm: "三餐 + 一次加餐",
    };
  }

  return {
    code: "mediterranean",
    name: "地中海式减脂",
    version: "v1",
    summary: "强调食物质量与长期执行舒适度。",
    executionScore: 84,
    mealRhythm: "三餐 + 轻量加餐",
  };
}

function buildMacroTargets(planCode: string, weightKg: number, targetCalories: number): MacroTargets {
  const protein = clamp(weightKg * (planCode === "high-protein" ? 1.9 : 1.6), 95, 190);

  if (planCode === "high-protein") {
    const fat = clamp((targetCalories * 0.28) / 9, 42, 72);
    const carbs = clamp((targetCalories - protein * 4 - fat * 9) / 4, 75, 220);
    return { protein: round(protein), fat: round(fat), carbs: round(carbs), fiber: 30 };
  }

  if (planCode === "if") {
    const fat = clamp((targetCalories * 0.3) / 9, 40, 72);
    const carbs = clamp((targetCalories - protein * 4 - fat * 9) / 4, 70, 210);
    return { protein: round(protein), fat: round(fat), carbs: round(carbs), fiber: 28 };
  }

  if (planCode === "mediterranean") {
    const fat = clamp((targetCalories * 0.33) / 9, 45, 76);
    const carbs = clamp((targetCalories - protein * 4 - fat * 9) / 4, 90, 230);
    return { protein: round(protein), fat: round(fat), carbs: round(carbs), fiber: 32 };
  }

  const fat = clamp((targetCalories * 0.29) / 9, 42, 72);
  const carbs = clamp((targetCalories - protein * 4 - fat * 9) / 4, 85, 215);
  return { protein: round(protein), fat: round(fat), carbs: round(carbs), fiber: 30 };
}

export function computeAssessment(
  profile: UserProfile | null,
  bodyInputs: AssessmentBodyInputs
): AssessmentComputation {
  const weightKg = bodyInputs.weightKg ?? 70;
  const heightCm = profile?.heightCm ?? 170;
  const age = inferAge(profile?.birthDate);
  const bmr = estimateBmr(weightKg, heightCm, age, profile?.sex);
  const trainingDays = bodyInputs.trainingDaysPerWeek ?? profile?.trainingDaysPerWeek ?? 3;
  const activityMultiplier = parseActivityMultiplier(profile?.activityLevel);
  const tdee = bmr * activityMultiplier + trainingDays * 45;
  const targetCalories = round(clamp(tdee - 380, 1350, 2600));
  const recommendedPlan = buildRecommendedPlan({
    trainingDays,
    lifestylePayload: profile?.lifestylePayload ?? bodyInputs.bodyInputsPayload ?? {},
    targetCalories,
  });
  const targets = buildMacroTargets(recommendedPlan.code, weightKg, targetCalories);
  const bodyFatEstimate =
    bodyInputs.waistCm && heightCm
      ? round(clamp((bodyInputs.waistCm / heightCm) * 100 - 18, 10, 40))
      : undefined;

  return {
    targetCalories,
    targets,
    recommendedPlan,
    resultPayload: {
      inputWeightKg: weightKg,
      inputHeightCm: heightCm,
      estimatedBmr: round(bmr),
      estimatedTdee: round(tdee),
      estimatedBodyFatPercent: bodyFatEstimate,
      trainingDays,
      activityMultiplier,
    },
  };
}
