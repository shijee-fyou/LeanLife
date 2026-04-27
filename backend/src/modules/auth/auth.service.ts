import type { ApiEnvelope, UUID } from "../../shared/core-types.js";
import type { AuthModule, AuthSession, LoginRequest, RegisterRequest } from "./auth.contract.js";
import type { AuthRepository } from "./auth.repository.js";

export class AuthService implements AuthModule {
  constructor(private readonly repository: AuthRepository) {}

  async register(input: RegisterRequest): Promise<ApiEnvelope<AuthSession>> {
    const session = await this.repository.createUser(input);
    return { data: session };
  }

  async login(input: LoginRequest): Promise<ApiEnvelope<AuthSession>> {
    const session = await this.repository.validateUser(input);
    return { data: session };
  }

  async logout(userId: UUID): Promise<void> {
    await this.repository.revokeSessions(userId);
  }

  async rotateRefreshToken(refreshToken: string): Promise<ApiEnvelope<AuthSession>> {
    const session = await this.repository.validateUser({
      email: refreshToken.replace("dev-refresh-token:", ""),
      password: "rotation-placeholder",
    });
    return { data: session };
  }
}
