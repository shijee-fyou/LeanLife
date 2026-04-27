import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface StoredAuthUser {
  id: string;
  email: string;
  passwordHash: string;
  role: "user" | "coach" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface StoredProfile {
  id: string;
  userId: string;
  displayName?: string;
  sex?: string;
  birthDate?: string;
  heightCm?: number;
  goalType: "fat_loss";
  activityLevel?: string;
  trainingDaysPerWeek?: number;
  timezone: string;
  lifestylePayload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAssessment {
  id: string;
  userId: string;
  assessmentDate: string;
  targetCalories: number;
  targets: {
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
  recommendedPlan: {
    code: string;
    name: string;
    version: string;
    summary: string;
    executionScore: number;
    mealRhythm: string;
  };
  algorithmVersion: string;
  resultPayload: Record<string, unknown>;
  createdAt: string;
}

export interface StoredDailyLog {
  id: string;
  userId: string;
  logDate: string;
  activePlanCode?: string;
  activePlanVersion?: string;
  assessmentId?: string;
  energyScore?: number;
  hungerScore?: number;
  adherenceScore?: number;
  planMatchScore?: number;
  note?: string;
  bodyMetrics?: {
    weightKg?: number;
    waistCm?: number;
    sleepHours?: number;
    hydrationMl?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoredFoodEntry {
  id: string;
  userId: string;
  logDate: string;
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
  createdAt: string;
}

export interface DevDataSnapshot {
  users: StoredAuthUser[];
  profiles: StoredProfile[];
  assessments: StoredAssessment[];
  dailyLogs: StoredDailyLog[];
  foodEntries: StoredFoodEntry[];
}

const EMPTY_SNAPSHOT: DevDataSnapshot = {
  users: [],
  profiles: [],
  assessments: [],
  dailyLogs: [],
  foodEntries: [],
};

/**
 * 轻量本地 JSON 存储，仅用于当前后端骨架阶段。
 * 后续切到 PostgreSQL 时，只需要替换 repository 层。
 */
export class DevDataStore {
  constructor(private readonly filePath: string) {}

  async read(): Promise<DevDataSnapshot> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<DevDataSnapshot>;
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
        assessments: Array.isArray(parsed.assessments) ? parsed.assessments : [],
        dailyLogs: Array.isArray(parsed.dailyLogs) ? parsed.dailyLogs : [],
        foodEntries: Array.isArray(parsed.foodEntries) ? parsed.foodEntries : [],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("ENOENT")) {
        await this.write(EMPTY_SNAPSHOT);
        return { ...EMPTY_SNAPSHOT };
      }
      throw error;
    }
  }

  async write(snapshot: DevDataSnapshot): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(snapshot, null, 2), "utf8");
  }

  async mutate(mutator: (snapshot: DevDataSnapshot) => DevDataSnapshot | Promise<DevDataSnapshot>): Promise<DevDataSnapshot> {
    const current = await this.read();
    const next = await mutator(current);
    await this.write(next);
    return next;
  }
}
