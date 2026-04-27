import type { ModuleShape } from "../../shared/kernel/module-shape.js";
import type { TrackingRepository } from "./tracking.repository.js";
import { TrackingController } from "./tracking.controller.js";
import { TrackingService } from "./tracking.service.js";

export function createTrackingModule(
  repository: TrackingRepository
): ModuleShape<TrackingController, TrackingService, TrackingRepository> {
  const service = new TrackingService(repository);
  const controller = new TrackingController(service);
  return { controller, service, repository };
}
