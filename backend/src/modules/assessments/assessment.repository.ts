import { randomUUID } from "node:crypto";
import type { RequestContext } from "../../shared/core-types.js";
import { DevDataStore } from "../../shared/persistence/dev-data-store.js";
import type { RepositoryHealth } from "../../shared/persistence/repository.types.js";
import type { UserProfile } from "../profile/profile.contract.js";
import { computeAssessment } from "./assessment-calculator.js";
import { AssessmentDependencyError } from "./assessment.errors.js";
import type { AssessmentSnapshot, CreateAssessmentRequest } from "./assessment.contract.js";

export interface AssessmentRepository {
  create(ctx: RequestContext, input: CreateAssessmentRequest): Promise<AssessmentSnapshot>;
  list(ctx: RequestContext): Promise<AssessmentSnapshot[]>;
  health(): Promise<RepositoryHealth>;
}

export class LocalAssessmentRepository implements AssessmentRepository {
  constructor(private readonly store: DevDataStore) {}

  async create(ctx: RequestContext, input: CreateAssessmentRequest): Promise<AssessmentSnapshot> {
    const current = await this.store.read();
    const profileRecord = current.profiles.find((item) => item.userId === ctx.user.id);

    const profile: UserProfile | null = profileRecord
      ? {
          id: profileRecord.id,
          userId: profileRecord.userId,
          displayName: profileRecord.displayName,
          sex: profileRecord.sex,
          birthDate: profileRecord.birthDate,
          heightCm: profileRecord.heightCm,
          goalType: profileRecord.goalType,
          activityLevel: profileRecord.activityLevel,
          trainingDaysPerWeek: profileRecord.trainingDaysPerWeek,
          timezone: profileRecord.timezone,
          lifestylePayload: profileRecord.lifestylePayload,
        }
      : null;

    if (!profile?.heightCm && !input.bodyInputs.bodyInputsPayload?.heightCm) {
      throw new AssessmentDependencyError("Assessment requires at least one profile-based height input.");
    }

    const computed = computeAssessment(profile, input.bodyInputs);
    const now = new Date().toISOString();
    const snapshot: AssessmentSnapshot = {
      id: randomUUID(),
      assessmentDate: input.assessmentDate,
      targetCalories: computed.targetCalories,
      targets: computed.targets,
      recommendedPlan: computed.recommendedPlan,
      algorithmVersion: "dev-0.2.0",
      resultPayload: {
        ...computed.resultPayload,
        note: input.note,
      },
    };

    await this.store.mutate((data) => ({
      ...data,
      assessments: [
        ...data.assessments,
        {
          id: snapshot.id,
          userId: ctx.user.id,
          assessmentDate: snapshot.assessmentDate,
          targetCalories: snapshot.targetCalories,
          targets: snapshot.targets,
          recommendedPlan: snapshot.recommendedPlan,
          algorithmVersion: snapshot.algorithmVersion,
          resultPayload: snapshot.resultPayload,
          createdAt: now,
        },
      ],
    }));

    return snapshot;
  }

  async list(ctx: RequestContext): Promise<AssessmentSnapshot[]> {
    const current = await this.store.read();
    return current.assessments
      .filter((item) => item.userId === ctx.user.id)
      .sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))
      .map((item) => ({
        id: item.id,
        assessmentDate: item.assessmentDate,
        targetCalories: item.targetCalories,
        targets: item.targets,
        recommendedPlan: item.recommendedPlan,
        algorithmVersion: item.algorithmVersion,
        resultPayload: item.resultPayload,
      }));
  }

  async health(): Promise<RepositoryHealth> {
    await this.store.read();
    return { name: "assessment-repository", ready: true };
  }
}
