import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;

/**
 * 当前用于开发骨架的密码编码器。
 * 使用 Node 内置 scrypt，避免在未安装依赖时继续引入额外复杂度。
 */
export class PasswordCodec {
  hash(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const derived = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
    return `${salt}:${derived}`;
  }

  verify(password: string, encoded: string): boolean {
    const [salt, expected] = encoded.split(":");
    if (!salt || !expected) return false;
    const actual = scryptSync(password, salt, SCRYPT_KEYLEN);
    const expectedBuffer = Buffer.from(expected, "hex");
    return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
  }
}
