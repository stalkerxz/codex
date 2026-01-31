import { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../config.js";

export default async function paymentsRoutes(app: FastifyInstance) {
  app.post("/checkout", { preHandler: app.authenticate }, async (request) => {
    const body = z.object({ productId: z.string() }).parse(request.body);
    const product = await app.prisma.product.findUnique({ where: { id: body.productId } });
    if (!product) {
      throw app.httpErrors.notFound("Product not found");
    }
    const payment = await app.prisma.payment.create({
      data: {
        provider: config.paymentProvider,
        providerRef: `mock_${Date.now()}`,
        status: "pending",
        amountCents: product.priceCents,
        currency: product.currency,
        userId: request.user.id,
        productId: product.id
      }
    });

    return { checkoutUrl: `${config.baseUrl}/payments/mock/${payment.id}`, payment };
  });

  app.post("/webhook", async (request) => {
    const body = z.object({ paymentId: z.string(), status: z.enum(["paid", "failed", "refunded"]) }).parse(request.body);
    const payment = await app.prisma.payment.update({
      where: { id: body.paymentId },
      data: { status: body.status }
    });
    if (body.status === "paid") {
      const product = await app.prisma.product.findUnique({ where: { id: payment.productId } });
      if (!product) {
        return { received: true };
      }
      await app.prisma.enrollment.create({
        data: {
          courseId: product.courseId,
          userId: payment.userId,
          status: "active"
        }
      });
    }
    return { received: true };
  });
}
