import type { ModuleShape } from "../../shared/kernel/module-shape.js";
import type { AuthRepository } from "./auth.repository.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

export function createAuthModule(
  repository: AuthRepository
): ModuleShape<AuthController, AuthService, AuthRepository> {
  const service = new AuthService(repository);
  const controller = new AuthController(service);
  return { controller, service, repository };
}
