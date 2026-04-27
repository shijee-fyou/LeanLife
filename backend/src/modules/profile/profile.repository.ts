import { randomUUID } from "node:crypto";
import type { RequestContext } from "../../shared/core-types.js";
import { DevDataStore } from "../../shared/persistence/dev-data-store.js";
import type { RepositoryHealth } from "../../shared/persistence/repository.types.js";
import type { UserProfile, UpsertProfileRequest } from "./profile.contract.js";

export interface ProfileRepository {
  getByUser(ctx: RequestContext): Promise<UserProfile>;
  upsertByUser(ctx: RequestContext, input: UpsertProfileRequest): Promise<UserProfile>;
  health(): Promise<RepositoryHealth>;
}

export class LocalProfileRepository implements ProfileRepository {
  constructor(private readonly store: DevDataStore) {}

  async getByUser(ctx: RequestContext): Promise<UserProfile> {
    const snapshot = await this.store.read();
    const profile = snapshot.profiles.find((item) => item.userId === ctx.user.id);

    if (!profile) {
      return {
        id: "",
        userId: ctx.user.id,
        goalType: "fat_loss",
        timezone: ctx.timezone,
        lifestylePayload: {},
      };
    }

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      sex: profile.sex,
      birthDate: profile.birthDate,
      heightCm: profile.heightCm,
      goalType: profile.goalType,
      activityLevel: profile.activityLevel,
      trainingDaysPerWeek: profile.trainingDaysPerWeek,
      timezone: profile.timezone,
      lifestylePayload: profile.lifestylePayload,
    };
  }

  async upsertByUser(ctx: RequestContext, input: UpsertProfileRequest): Promise<UserProfile> {
    const now = new Date().toISOString();
    const snapshot = await this.store.mutate((current) => {
      const existing = current.profiles.find((item) => item.userId === ctx.user.id);

      if (!existing) {
        return {
          ...current,
          profiles: [
            ...current.profiles,
            {
              id: randomUUID(),
              userId: ctx.user.id,
              goalType: "fat_loss",
              timezone: input.timezone ?? ctx.timezone,
              lifestylePayload: input.lifestylePayload ?? {},
              displayName: input.displayName,
              sex: input.sex,
              birthDate: input.birthDate,
              heightCm: input.heightCm,
              activityLevel: input.activityLevel,
              trainingDaysPerWeek: input.trainingDaysPerWeek,
              createdAt: now,
              updatedAt: now,
            },
          ],
        };
      }

      return {
        ...current,
        profiles: current.profiles.map((profile) =>
          profile.userId === ctx.user.id
            ? {
                ...profile,
                displayName: input.displayName ?? profile.displayName,
                sex: input.sex ?? profile.sex,
                birthDate: input.birthDate ?? profile.birthDate,
                heightCm: input.heightCm ?? profile.heightCm,
                activityLevel: input.activityLevel ?? profile.activityLevel,
                trainingDaysPerWeek: input.trainingDaysPerWeek ?? profile.trainingDaysPerWeek,
                timezone: input.timezone ?? profile.timezone,
                lifestylePayload: input.lifestylePayload ?? profile.lifestylePayload,
                updatedAt: now,
              }
            : profile
        ),
      };
    });

    const profile = snapshot.profiles.find((item) => item.userId === ctx.user.id);
    if (!profile) {
      throw new Error("Failed to upsert profile in local store.");
    }

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      sex: profile.sex,
      birthDate: profile.birthDate,
      heightCm: profile.heightCm,
      goalType: profile.goalType,
      activityLevel: profile.activityLevel,
      trainingDaysPerWeek: profile.trainingDaysPerWeek,
      timezone: profile.timezone,
      lifestylePayload: profile.lifestylePayload,
    };
  }

  async health(): Promise<RepositoryHealth> {
    await this.store.read();
    return { name: "profile-repository", ready: true };
  }
}
