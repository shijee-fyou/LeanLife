import { createApplication } from "./server/create-application.js";
import { startHttpServer } from "./server/http-server.js";

/**
 * 当前入口保持极简。
 * 真正的业务依赖组装在 composition root 中，避免 main.ts 变成一锅粥。
 */
async function bootstrap() {
  const app = createApplication();
  const summary = app.describe();
  const port = Number(process.env.PORT || 4010);

  console.log("LeanLife backend scaffold is ready.");
  console.log(`Environment: ${summary.environment}`);
  console.log(`Modules: ${summary.modules.join(", ")}`);

  const registerResult = await app.auth.register({
    email: "demo@leanlife.local",
    password: "Demo123456",
  }).catch(() => app.auth.login({
    email: "demo@leanlife.local",
    password: "Demo123456",
  }));

  const profileResult = await app.profile.upsertProfile(
    {
      user: registerResult.data.user,
      timezone: "Asia/Shanghai",
    },
    {
      displayName: "LeanLife Demo",
      heightCm: 172,
      trainingDaysPerWeek: 4,
      lifestylePayload: {
        sleep: "regular",
        workStyle: "office",
      },
    }
  );

  const assessmentResult = await app.assessments.createAssessment(
    {
      user: registerResult.data.user,
      timezone: profileResult.data.timezone,
    },
    {
      assessmentDate: new Date().toISOString().slice(0, 10),
      bodyInputs: {
        weightKg: 76,
        waistCm: 86,
        trainingDaysPerWeek: 4,
      },
      note: "bootstrap demo assessment",
    }
  );

  const trackingResult = await app.tracking.upsertDailyLog(
    {
      user: registerResult.data.user,
      timezone: profileResult.data.timezone,
    },
    new Date().toISOString().slice(0, 10),
    {
      assessmentId: assessmentResult.data.id,
      activePlanCode: assessmentResult.data.recommendedPlan.code,
      activePlanVersion: assessmentResult.data.recommendedPlan.version,
      energyScore: 4,
      hungerScore: 2,
      adherenceScore: 5,
      planMatchScore: 5,
      bodyMetrics: {
        weightKg: 76,
        waistCm: 86,
        hydrationMl: 2100,
      },
    }
  );

  const trendResult = await app.tracking.getTrend(
    {
      user: registerResult.data.user,
      timezone: profileResult.data.timezone,
    },
    {
      metric: "weight",
      rangeDays: 14,
    }
  );

  const foodEntryResult = await app.nutrition.addFoodEntry(
    {
      user: registerResult.data.user,
      timezone: profileResult.data.timezone,
    },
    new Date().toISOString().slice(0, 10),
    {
      foodId: "oats",
      mealSlot: "breakfast",
      unitKey: "g",
      amount: 80,
    }
  );

  const nutritionResult = await app.nutrition.getNutritionAnalysis(
    {
      user: registerResult.data.user,
      timezone: profileResult.data.timezone,
    },
    new Date().toISOString().slice(0, 10)
  );

  console.log(`Bootstrap user: ${registerResult.data.user.email}`);
  console.log(`Profile timezone: ${profileResult.data.timezone}`);
  console.log(`Assessment calories: ${assessmentResult.data.targetCalories}`);
  console.log(`Recommended plan: ${assessmentResult.data.recommendedPlan.name}`);
  console.log(`Tracking date: ${trackingResult.data.logDate}`);
  console.log(`Trend points: ${trendResult.data.points.length}`);
  console.log(`Added food entry: ${foodEntryResult.data.nutrition.calories} kcal`);
  console.log(`Nutrition score: ${nutritionResult.data.nutrition.nutritionScore}`);

  await startHttpServer(app, port);
}

void bootstrap();
