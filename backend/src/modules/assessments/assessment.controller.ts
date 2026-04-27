import type { ApiEnvelope, RequestContext } from "../../shared/core-types.js";
import type { AssessmentSnapshot, CreateAssessmentRequest } from "./assessment.contract.js";
import type { AssessmentService } from "./assessment.service.js";

export class AssessmentController {
  constructor(private readonly service: AssessmentService) {}

  createAssessment(ctx: RequestContext, input: CreateAssessmentRequest): Promise<ApiEnvelope<AssessmentSnapshot>> {
    return this.service.createAssessment(ctx, input);
  }

  listAssessments(ctx: RequestContext): Promise<ApiEnvelope<AssessmentSnapshot[]>> {
    return this.service.listAssessments(ctx);
  }
}
