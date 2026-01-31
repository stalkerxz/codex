import { describe, it, expect } from "vitest";
import { buildApp } from "../src/app.js";

const hasDb = Boolean(process.env.DATABASE_URL);
const suite = hasDb ? describe : describe.skip;

suite("auth flow", () => {
  it("registers and logs in", async () => {
    const app = await buildApp();
    const email = `user_${Date.now()}@test.dev`;

    const register = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email, password: "Password123!", name: "Test User" }
    });

    expect(register.statusCode).toBe(200);
    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email, password: "Password123!" }
    });

    expect(login.statusCode).toBe(200);
    await app.close();
  });
});
