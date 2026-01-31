import { FastifyInstance } from "fastify";
import { z } from "zod";

export default async function adminRoutes(app: FastifyInstance) {
  const adminGuard = app.authorize(["admin", "author"]);

  app.get("/users", { preHandler: adminGuard }, async () => {
    return app.prisma.user.findMany();
  });

  app.post("/courses", { preHandler: adminGuard }, async (request) => {
    const body = z.object({ title: z.string(), slug: z.string(), description: z.string() }).parse(request.body);
    return app.prisma.course.create({ data: body });
  });

  app.post("/modules", { preHandler: adminGuard }, async (request) => {
    const body = z.object({ title: z.string(), order: z.number(), courseId: z.string() }).parse(request.body);
    return app.prisma.module.create({ data: body });
  });

  app.post("/lessons", { preHandler: adminGuard }, async (request) => {
    const body = z.object({ title: z.string(), slug: z.string(), summary: z.string(), order: z.number(), moduleId: z.string() }).parse(request.body);
    return app.prisma.lesson.create({ data: body });
  });

  app.post("/simulator/scenes", { preHandler: adminGuard }, async (request) => {
    const body = z.object({
      title: z.string(),
      category: z.string(),
      description: z.string(),
      baseImage: z.string(),
      lightKelvin: z.number(),
      lightTint: z.number(),
      movement: z.number(),
      distanceM: z.number(),
      focalMM: z.number(),
      difficulty: z.number()
    }).parse(request.body);

    return app.prisma.simulatorScene.create({ data: body });
  });
}
