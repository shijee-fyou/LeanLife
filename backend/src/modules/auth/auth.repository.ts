import { randomUUID } from "node:crypto";
import type { UUID } from "../../shared/core-types.js";
import { DevDataStore } from "../../shared/persistence/dev-data-store.js";
import type { RepositoryHealth } from "../../shared/persistence/repository.types.js";
import { PasswordCodec } from "../../shared/security/password-codec.js";
import { createSessionTokens } from "../../shared/security/session-token.js";
import type { AuthSession, LoginRequest, RegisterRequest } from "./auth.contract.js";

export interface AuthRepository {
  createUser(input: RegisterRequest): Promise<AuthSession>;
  validateUser(input: LoginRequest): Promise<AuthSession>;
  getUserById(userId: UUID): Promise<{ id: UUID; email: string; role: "user" | "coach" | "admin" } | null>;
  revokeSessions(userId: UUID): Promise<void>;
  health(): Promise<RepositoryHealth>;
}

export class LocalAuthRepository implements AuthRepository {
  constructor(
    private readonly store: DevDataStore,
    private readonly passwordCodec: PasswordCodec,
    private readonly jwtSecret: string
  ) {}

  async createUser(input: RegisterRequest): Promise<AuthSession> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const now = new Date().toISOString();
    const passwordHash = this.passwordCodec.hash(input.password);

    const snapshot = await this.store.mutate((current) => {
      const alreadyExists = current.users.some((item) => item.email === normalizedEmail);
      if (alreadyExists) {
        throw new Error(`User already exists for email: ${normalizedEmail}`);
      }

      return {
        ...current,
        users: [
          ...current.users,
          {
            id: randomUUID(),
            email: normalizedEmail,
            passwordHash,
            role: "user",
            createdAt: now,
            updatedAt: now,
          },
        ],
      };
    });

    const created = snapshot.users.find((item) => item.email === normalizedEmail);
    if (!created) {
      throw new Error("Failed to create user in local store.");
    }

    const tokens = createSessionTokens(created.id, this.jwtSecret);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: created.id,
        email: created.email,
        role: "user",
      },
    };
  }

  async validateUser(input: LoginRequest): Promise<AuthSession> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const snapshot = await this.store.read();
    const user = snapshot.users.find((item) => item.email === normalizedEmail);

    if (!user || !this.passwordCodec.verify(input.password, user.passwordHash)) {
      throw new Error("Invalid email or password.");
    }

    const tokens = createSessionTokens(user.id, this.jwtSecret);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getUserById(userId: UUID): Promise<{ id: UUID; email: string; role: "user" | "coach" | "admin" } | null> {
    const snapshot = await this.store.read();
    const user = snapshot.users.find((item) => item.id === userId);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async revokeSessions(_userId: UUID): Promise<void> {}

  async health(): Promise<RepositoryHealth> {
    await this.store.read();
    return { name: "auth-repository", ready: true };
  }
}
