import { describe, expect, it } from "vitest";
process.env.ENCRYPTION_KEY = "12345678901234567890123456789012";
process.env.JWT_SECRET = "12345678901234567890123456789012";
process.env.JWT_REFRESH_SECRET = "12345678901234567890123456789012";
process.env.DATABASE_URL = "http://localhost";
process.env.REDIS_URL = "http://localhost";

describe("crypto", () => {
  it("round trips JSON", () => {
    return import("./crypto").then(({ encryptJson, decryptJson }) => {
      return import("./env").then(({ env }) => {
        expect(env.ENCRYPTION_KEY).toBeDefined();
        const data = { token: "abc" };
        const encrypted = encryptJson(data);
        const decrypted = decryptJson(encrypted);
        expect(decrypted).toEqual(data);
      });
    });
  });
});
