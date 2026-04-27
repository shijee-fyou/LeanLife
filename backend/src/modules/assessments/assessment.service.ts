import type { ApiEnvelope, RequestContext } from "../../shared/core-types.js";
import type { AssessmentModule, AssessmentSnapshot, CreateAssessmentRequest } from "./assessment.contract.js";
import type { AssessmentRepository } from "./assessment.repository.js";

export class AssessmentService implements AssessmentModule {
  constructor(private readonly repository: AssessmentRepository) {}

  async createAssessment(ctx: RequestContext, input: CreateAssessmentRequest): Promise<ApiEnvelope<AssessmentSnapshot>> {
    const snapshot = await this.repository.create(ctx, input);
    return {
      data: snapshot,
      meta: {
        algorithmVersion: snapshot.algorithmVersion,
      },
    };
  }

  async listAssessments(ctx: RequestContext): Promise<ApiEnvelope<AssessmentSnapshot[]>> {
    const items = await this.repository.list(ctx);
    return { data: items };
  }
}
