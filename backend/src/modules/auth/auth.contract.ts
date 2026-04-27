import type { ApiEnvelope, AuthenticatedUser, UUID } from "../../shared/core-types.js";

/**
 * Auth 模块只负责身份认证，不向下游泄漏身体评估或营养分析细节。
 */

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

export interface AuthModule {
  register(input: RegisterRequest): Promise<ApiEnvelope<AuthSession>>;
  login(input: LoginRequest): Promise<ApiEnvelope<AuthSession>>;
  logout(userId: UUID): Promise<void>;
  rotateRefreshToken(refreshToken: string): Promise<ApiEnvelope<AuthSession>>;
}
