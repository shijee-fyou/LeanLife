import { demoAssessment, demoDailyLog, demoProfile, demoSession } from "./demo-data";
import type { ApiEnvelope, AssessmentSnapshot, AuthSession, DailyLogDetail, UserProfile } from "./types";

const BASE_URL = process.env.LEANLIFE_BACKEND_URL ?? "http://127.0.0.1:4010";

async function request<TData>(path: string, init?: RequestInit): Promise<TData> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed for ${path}`);
  }

  const envelope = (await response.json()) as ApiEnvelope<TData>;
  return envelope.data;
}

async function loginOrRegister(): Promise<AuthSession> {
  try {
    return await request<AuthSession>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "demo@leanlife.local",
        password: "Demo123456",
      }),
    });
  } catch {
    return request<AuthSession>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "demo@leanlife.local",
        password: "Demo123456",
      }),
    });
  }
}

function authHeaders(session: AuthSession): HeadersInit {
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "X-Timezone": "Asia/Shanghai",
  };
}

/**
 * 当前优先走真实后端。
 * 如果本地后端暂时没起，再优雅回退到 demo 数据，保证前端页面仍然可读。
 */
export const apiClient = {
  async login(): Promise<AuthSession> {
    try {
      return await loginOrRegister();
    } catch {
      return demoSession;
    }
  },
  async getProfile(session?: AuthSession): Promise<UserProfile> {
    if (!session) return demoProfile;

    try {
      return await request<UserProfile>("/v1/profile", {
        method: "PUT",
        headers: authHeaders(session),
        body: JSON.stringify({
          displayName: "LeanLife Demo",
          heightCm: 172,
          activityLevel: "moderate",
          trainingDaysPerWeek: 4,
          timezone: "Asia/Shanghai",
          lifestylePayload: {
            sleep: "regular",
            workStyle: "office",
          },
        }),
      });
    } catch {
      return demoProfile;
    }
  },
  async getLatestAssessment(session?: AuthSession): Promise<AssessmentSnapshot> {
    if (!session) return demoAssessment;

    try {
      const history = await request<AssessmentSnapshot[]>("/v1/assessments", {
        method: "GET",
        headers: authHeaders(session),
      });

      if (history.length) return history[0];

      return await request<AssessmentSnapshot>("/v1/assessments", {
        method: "POST",
        headers: authHeaders(session),
        body: JSON.stringify({
          assessmentDate: "2026-04-21",
          bodyInputs: {
            weightKg: 76,
            waistCm: 86,
            trainingDaysPerWeek: 4,
          },
          note: "frontend bootstrap assessment",
        }),
      });
    } catch {
      return demoAssessment;
    }
  },
  async getDailyLog(session?: AuthSession, assessment?: AssessmentSnapshot): Promise<DailyLogDetail> {
    if (!session || !assessment) return demoDailyLog;

    try {
      const logDate = assessment.assessmentDate;
      const existing = await request<DailyLogDetail>(`/v1/daily-logs/${logDate}`, {
        method: "GET",
        headers: authHeaders(session),
      });

      const withTracking =
        existing.bodyMetrics?.weightKg !== undefined
          ? existing
          : await request<DailyLogDetail>(`/v1/daily-logs/${logDate}`, {
              method: "PUT",
              headers: authHeaders(session),
              body: JSON.stringify({
                assessmentId: assessment.id,
                activePlanCode: assessment.recommendedPlan.code,
                activePlanVersion: assessment.recommendedPlan.version,
                energyScore: 4,
                hungerScore: 2,
                adherenceScore: 5,
                planMatchScore: 5,
                bodyMetrics: {
                  weightKg: 76,
                  waistCm: 86,
                  hydrationMl: 2100,
                },
              }),
            });

      if (!withTracking.foods.length) {
        await request(`/v1/daily-logs/${logDate}/foods`, {
          method: "POST",
          headers: authHeaders(session),
          body: JSON.stringify({
            foodId: "oats",
            mealSlot: "breakfast",
            unitKey: "g",
            amount: 80,
          }),
        });
      }

      return await request<DailyLogDetail>(`/v1/daily-logs/${logDate}`, {
        method: "GET",
        headers: authHeaders(session),
      });
    } catch {
      return demoDailyLog;
    }
  },
};
