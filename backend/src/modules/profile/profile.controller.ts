import type { ApiEnvelope, RequestContext } from "../../shared/core-types.js";
import type { UpsertProfileRequest, UserProfile } from "./profile.contract.js";
import type { ProfileService } from "./profile.service.js";

export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  getCurrentProfile(ctx: RequestContext): Promise<ApiEnvelope<UserProfile>> {
    return this.service.getCurrentProfile(ctx);
  }

  upsertProfile(ctx: RequestContext, input: UpsertProfileRequest): Promise<ApiEnvelope<UserProfile>> {
    return this.service.upsertProfile(ctx, input);
  }
}
