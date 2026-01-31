import { FastifyInstance } from "fastify";
import { z } from "zod";

export default async function analyticsRoutes(app: FastifyInstance) {
  app.post("/event", async (request) => {
    const body = z.object({
      name: z.string(),
      userId: z.string().optional(),
      lessonId: z.string().optional(),
      metadata: z.record(z.any()).optional()
    }).parse(request.body);

    app.log.info({ analytics: body }, "analytics event");
    return { status: "ok" };
  });
}
