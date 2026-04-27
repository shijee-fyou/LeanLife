import type { ApiEnvelope, RequestContext } from "../../shared/core-types.js";
import type { ProfileModule, UpsertProfileRequest, UserProfile } from "./profile.contract.js";
import type { ProfileRepository } from "./profile.repository.js";

export class ProfileService implements ProfileModule {
  constructor(private readonly repository: ProfileRepository) {}

  async getCurrentProfile(ctx: RequestContext): Promise<ApiEnvelope<UserProfile>> {
    const profile = await this.repository.getByUser(ctx);
    return { data: profile };
  }

  async upsertProfile(ctx: RequestContext, input: UpsertProfileRequest): Promise<ApiEnvelope<UserProfile>> {
    const profile = await this.repository.upsertByUser(ctx, input);
    return { data: profile };
  }
}
