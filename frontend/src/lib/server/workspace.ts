import { demoAssessment, demoDailyLog, demoProfile, demoSession } from "../demo-data";
import type {
  ApiEnvelope,
  AssessmentSnapshot,
  AuthSession,
  DailyLogDetail,
  FoodCatalogItemView,
  UserProfile,
  WorkspaceData,
} from "../types";

const BASE_URL = process.env.LEANLIFE_BACKEND_URL ?? "http://127.0.0.1:4010";

type JsonInit = RequestInit & { body?: string };

async function request<TData>(path: string, init?: JsonInit): Promise<TData> {
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

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "X-Timezone": "Asia/Shanghai",
  };
}

const defaultProfileInput = {
  displayName: "LeanLife User",
  heightCm: 172,
  activityLevel: "moderate",
  trainingDaysPerWeek: 4,
  timezone: "Asia/Shanghai",
  lifestylePayload: { sleep: "regular", workStyle: "office" },
};

async function ensureProfile(token: string): Promise<UserProfile> {
  const existing = await request<UserProfile>("/v1/profile", {
    method: "GET",
    headers: authHeaders(token),
  }).catch(() => null);

  if (existing) return existing;

  return request<UserProfile>("/v1/profile", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(defaultProfileInput),
  });
}

async function ensureAssessment(token: string): Promise<AssessmentSnapshot> {
  const history = await request<AssessmentSnapshot[]>("/v1/assessments", {
    method: "GET",
    headers: authHeaders(token),
  });

  if (history.length) return history[0];

  return request<AssessmentSnapshot>("/v1/assessments", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      assessmentDate: new Date().toISOString().slice(0, 10),
      bodyInputs: { weightKg: 70, waistCm: 80, trainingDaysPerWeek: 3 },
      note: "initial assessment",
    }),
  });
}

async function ensureDailyLog(token: string, assessment: AssessmentSnapshot): Promise<DailyLogDetail> {
  const logDate = new Date().toISOString().slice(0, 10);

  try {
    const existing = await request<DailyLogDetail>(`/v1/daily-logs/${logDate}`, {
      method: "GET",
      headers: authHeaders(token),
    });
    if (existing.bodyMetrics?.weightKg !== undefined) return existing;
  } catch {
    // noop
  }

  return request<DailyLogDetail>(`/v1/daily-logs/${logDate}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      assessmentId: assessment.id,
      activePlanCode: assessment.recommendedPlan.code,
      activePlanVersion: assessment.recommendedPlan.version,
      energyScore: 4,
      hungerScore: 2,
      adherenceScore: 5,
      planMatchScore: 5,
      bodyMetrics: { weightKg: 70, waistCm: 80, hydrationMl: 2000 },
    }),
  });
}

async function listFoods(token: string): Promise<FoodCatalogItemView[]> {
  return request<FoodCatalogItemView[]>("/v1/foods", {
    method: "GET",
    headers: authHeaders(token),
  });
}

function demoWorkspace(): WorkspaceData {
  return { session: demoSession, profile: demoProfile, assessment: demoAssessment, dailyLog: demoDailyLog, foods: [] };
}

async function buildWorkspace(token: string): Promise<WorkspaceData> {
  const fakeSession: AuthSession = {
    accessToken: token,
    refreshToken: "",
    user: { id: "", email: "", role: "user" },
  };
  const profile = await ensureProfile(token);
  const assessment = await ensureAssessment(token);
  const dailyLog = await ensureDailyLog(token, assessment);
  const foods = await listFoods(token);
  return { session: fakeSession, profile, assessment, dailyLog, foods };
}

export async function bootstrapWorkspace(token: string): Promise<WorkspaceData> {
  try {
    return await buildWorkspace(token);
  } catch {
    return demoWorkspace();
  }
}

export async function updateWorkspaceProfile(token: string, input: Record<string, unknown>): Promise<WorkspaceData> {
  await request<UserProfile>("/v1/profile", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  return buildWorkspace(token);
}

export async function createWorkspaceAssessment(token: string, input: Record<string, unknown>): Promise<WorkspaceData> {
  await request<AssessmentSnapshot>("/v1/assessments", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  return buildWorkspace(token);
}

export async function updateWorkspaceDailyLog(
  token: string,
  logDate: string,
  input: Record<string, unknown>
): Promise<WorkspaceData> {
  await request<DailyLogDetail>(`/v1/daily-logs/${logDate}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  return buildWorkspace(token);
}

export async function addWorkspaceFood(
  token: string,
  logDate: string,
  input: Record<string, unknown>
): Promise<WorkspaceData> {
  await request(`/v1/daily-logs/${logDate}/foods`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  return buildWorkspace(token);
}

export async function fetchDailyLogForDate(token: string, date: string): Promise<DailyLogDetail | null> {
  try {
    return await request<DailyLogDetail>(`/v1/daily-logs/${date}`, {
      method: "GET",
      headers: authHeaders(token),
    });
  } catch {
    return null;
  }
}
