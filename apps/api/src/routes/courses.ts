import { FastifyInstance } from "fastify";
import { z } from "zod";

export default async function courseRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return app.prisma.course.findMany({ include: { modules: true } });
  });

  app.get("/:slug", async (request, reply) => {
    const slug = z.string().parse(request.params?.slug ?? request.params?.["slug"]);
    const course = await app.prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: {
            lessons: true
          },
          orderBy: { order: "asc" }
        }
      }
    });
    if (!course) {
      return reply.notFound("Course not found");
    }
    return course;
  });

  app.get("/lessons/:slug", async (request, reply) => {
    const slug = z.string().parse(request.params?.slug ?? request.params?.["slug"]);
    const lesson = await app.prisma.lesson.findUnique({
      where: { slug },
      include: {
        content: { orderBy: { order: "asc" } },
        quizzes: { include: { questions: { include: { answers: true } } } },
        homeworks: true
      }
    });
    if (!lesson) {
      return reply.notFound("Lesson not found");
    }
    return lesson;
  });

  app.post("/progress", { preHandler: app.authenticate }, async (request) => {
    const body = z.object({ lessonId: z.string(), status: z.string() }).parse(request.body);
    return { status: "ok", lessonId: body.lessonId, progress: body.status };
  });
}
