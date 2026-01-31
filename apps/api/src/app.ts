import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import simulatorRoutes from "./routes/simulator.js";
import adminRoutes from "./routes/admin.js";
import paymentsRoutes from "./routes/payments.js";
import analyticsRoutes from "./routes/analytics.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: [config.corsOrigin],
    credentials: true
  });

  await app.register(sensible);
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "PROTOPOPOV API",
        version: "1.0.0"
      }
    }
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs"
  });

  await app.register(prismaPlugin);
  await app.register(authPlugin);

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(courseRoutes, { prefix: "/courses" });
  await app.register(simulatorRoutes, { prefix: "/simulator" });
  await app.register(adminRoutes, { prefix: "/admin" });
  await app.register(paymentsRoutes, { prefix: "/payments" });
  await app.register(analyticsRoutes, { prefix: "/analytics" });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
