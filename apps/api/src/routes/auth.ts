import { z } from "zod";
import { FastifyInstance } from "fastify";
import { hashPassword, verifyPassword } from "../lib/passwords.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export default async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const existing = await app.prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return reply.badRequest("Email already registered");
    }

    const user = await app.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash: await hashPassword(body.password)
      }
    });

    const token = app.jwt.sign({ id: user.id, role: user.role, email: user.email, name: user.name });
    return reply.send({ token, user });
  });

  app.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await app.prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return reply.unauthorized("Invalid credentials");
    }
    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return reply.unauthorized("Invalid credentials");
    }
    const token = app.jwt.sign({ id: user.id, role: user.role, email: user.email, name: user.name });
    return reply.send({ token, user });
  });

  app.get("/me", { preHandler: app.authenticate }, async (request) => {
    const user = request.user;
    return { user };
  });
}
