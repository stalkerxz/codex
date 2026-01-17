import { FastifyInstance } from "fastify";
import fastifyJwt from "fastify-jwt";
import { env } from "./env";

export const registerAuth = (app: FastifyInstance) => {
  app.register(fastifyJwt, {
    secret: env.JWT_SECRET
  });

  app.decorate("authenticate", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: "Unauthorized" });
    }
  });
};

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
  interface FastifyRequest {
    user: {
      sub: string;
      email: string;
    };
  }
}
