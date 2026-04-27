import type { ModuleShape } from "../../shared/kernel/module-shape.js";
import type { ProfileRepository } from "./profile.repository.js";
import { ProfileController } from "./profile.controller.js";
import { ProfileService } from "./profile.service.js";

export function createProfileModule(
  repository: ProfileRepository
): ModuleShape<ProfileController, ProfileService, ProfileRepository> {
  const service = new ProfileService(repository);
  const controller = new ProfileController(service);
  return { controller, service, repository };
}
