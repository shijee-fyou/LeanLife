import type { ApiEnvelope } from "../../shared/core-types.js";
import type { AuthSession, LoginRequest, RegisterRequest } from "./auth.contract.js";
import type { AuthService } from "./auth.service.js";

/**
 * 控制器层暂时不绑定具体 Web 框架。
 * 这样后续切 NestJS/Express/Fastify 时，不会污染业务方法定义。
 */
export class AuthController {
  constructor(private readonly service: AuthService) {}

  register(input: RegisterRequest): Promise<ApiEnvelope<AuthSession>> {
    return this.service.register(input);
  }

  login(input: LoginRequest): Promise<ApiEnvelope<AuthSession>> {
    return this.service.login(input);
  }
}
