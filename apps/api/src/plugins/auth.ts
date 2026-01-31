import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { config } from "../config.js";

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: config.jwtSecret
  });

  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ message: "Unauthorized" });
    }
  });

  fastify.decorate("authorize", (roles: string[]) => {
    return async (request, reply) => {
      await fastify.authenticate(request, reply);
      const user = request.user as { role?: string };
      if (!user?.role || !roles.includes(user.role)) {
        reply.code(403).send({ message: "Forbidden" });
      }
    };
  });
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
    authorize: (roles: string[]) => (request: any, reply: any) => Promise<void>;
  }
}
