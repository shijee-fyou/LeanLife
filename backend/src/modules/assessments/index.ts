import type { ModuleShape } from "../../shared/kernel/module-shape.js";
import type { AssessmentRepository } from "./assessment.repository.js";
import { AssessmentController } from "./assessment.controller.js";
import { AssessmentService } from "./assessment.service.js";

export function createAssessmentModule(
  repository: AssessmentRepository
): ModuleShape<AssessmentController, AssessmentService, AssessmentRepository> {
  const service = new AssessmentService(repository);
  const controller = new AssessmentController(service);
  return { controller, service, repository };
}
