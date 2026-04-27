import type { ModuleShape } from "../../shared/kernel/module-shape.js";
import type { NutritionRepository } from "./nutrition.repository.js";
import { NutritionController } from "./nutrition.controller.js";
import { NutritionService } from "./nutrition.service.js";

export function createNutritionModule(
  repository: NutritionRepository
): ModuleShape<NutritionController, NutritionService, NutritionRepository> {
  const service = new NutritionService(repository);
  const controller = new NutritionController(service);
  return { controller, service, repository };
}
