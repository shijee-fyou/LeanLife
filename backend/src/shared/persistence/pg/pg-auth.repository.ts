import pg from "pg";
import type { UUID } from "../../core-types.js";
import type { RepositoryHealth } from "../repository.types.js";
import { PasswordCodec } from "../../security/password-codec.js";
import { createSessionTokens } from "../../security/session-token.js";
import type { AuthRepository } from "../../../modules/auth/auth.repository.js";
import type { AuthSession, LoginRequest, RegisterRequest } from "../../../modules/auth/auth.contract.js";

export class PgAuthRepository implements AuthRepository {
  constructor(
    private readonly pool: pg.Pool,
    private readonly passwordCodec: PasswordCodec,
    private readonly jwtSecret: string
  ) {}

  async createUser(input: RegisterRequest): Promise<AuthSession> {
    const email = input.email.trim().toLowerCase();
    const passwordHash = this.passwordCodec.hash(input.password);

    const res = await this.pool.query<{ id: string; email: string; role: string }>(
      `INSERT INTO users (id, email, password_hash, role, status)
       VALUES (gen_random_uuid(), $1, $2, 'user', 'active')
       RETURNING id, email, role`,
      [email, passwordHash]
    );

    const user = res.rows[0];
    if (!user) throw new Error("Failed to create user.");

    await this.pool.query(
      `INSERT INTO user_profiles (id, user_id)
       VALUES (gen_random_uuid(), $1)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id]
    );

    const tokens = createSessionTokens(user.id, this.jwtSecret);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user.id, email: user.email, role: "user" },
    };
  }

  async validateUser(input: LoginRequest): Promise<AuthSession> {
    const email = input.email.trim().toLowerCase();
    const res = await this.pool.query<{ id: string; email: string; password_hash: string; role: string }>(
      `SELECT id, email, password_hash, role FROM users WHERE email = $1 AND status = 'active'`,
      [email]
    );

    const user = res.rows[0];
    if (!user || !this.passwordCodec.verify(input.password, user.password_hash)) {
      throw new Error("Invalid email or password.");
    }

    const tokens = createSessionTokens(user.id, this.jwtSecret);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user.id, email: user.email, role: user.role as "user" | "coach" | "admin" },
    };
  }

  async getUserById(userId: UUID): Promise<{ id: UUID; email: string; role: "user" | "coach" | "admin" } | null> {
    const res = await this.pool.query<{ id: string; email: string; role: string }>(
      `SELECT id, email, role FROM users WHERE id = $1 AND status = 'active'`,
      [userId]
    );
    const row = res.rows[0];
    if (!row) return null;
    return { id: row.id, email: row.email, role: row.role as "user" | "coach" | "admin" };
  }

  async revokeSessions(_userId: UUID): Promise<void> {
    // MVP: no token blacklist; tokens expire naturally
  }

  async health(): Promise<RepositoryHealth> {
    await this.pool.query("SELECT 1");
    return { name: "auth-repository", ready: true };
  }
}
