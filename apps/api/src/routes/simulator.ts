import { FastifyInstance } from "fastify";
import { z } from "zod";
import { evaluateSettings, scoreAttempt, settingsSchema } from "@proto/simulator";

export default async function simulatorRoutes(app: FastifyInstance) {
  app.get("/scenes", async () => {
    return app.prisma.simulatorScene.findMany({ include: { tasks: true } });
  });

  app.get("/tasks/:id", async (request, reply) => {
    const id = z.string().parse(request.params?.id ?? request.params?.["id"]);
    const task = await app.prisma.simulatorTask.findUnique({ where: { id }, include: { scene: true } });
    if (!task) {
      return reply.notFound("Task not found");
    }
    return task;
  });

  app.post("/evaluate", { preHandler: app.authenticate }, async (request) => {
    const settings = settingsSchema.parse(request.body);
    return evaluateSettings(settings);
  });

  app.post("/attempts", { preHandler: app.authenticate }, async (request) => {
    const body = z.object({ taskId: z.string(), settings: settingsSchema }).parse(request.body);
    const task = await app.prisma.simulatorTask.findUnique({ where: { id: body.taskId } });
    if (!task) {
      throw app.httpErrors.notFound("Task not found");
    }
    const scored = scoreAttempt(body.settings, {
      targetEV: task.targetEV,
      maxBlur: task.maxBlur,
      maxNoise: task.maxNoise,
      minDOF: task.minDOF
    });
    const attempt = await app.prisma.simulatorAttempt.create({
      data: {
        taskId: task.id,
        studentId: request.user.id,
        settings: body.settings,
        score: scored.score,
        feedback: scored.feedback
      }
    });
    return { attempt, result: scored.result };
  });
}
