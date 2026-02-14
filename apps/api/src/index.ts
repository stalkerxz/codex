import Fastify from "fastify";
import cors from "fastify-cors";
import rateLimit from "fastify-rate-limit";
import swagger from "fastify-swagger";
import swaggerUi from "fastify-swagger-ui";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { env } from "./env";
import { prisma } from "./prisma";
import { registerAuth } from "./auth";
import { encryptJson, decryptJson } from "./crypto";
import { platformAdapters } from "./platforms";
import { createPresignedUpload } from "./storage";
import {
  loginSchema,
  postSchema,
  postTargetSchema,
  registerSchema,
  scheduleSchema,
  socialAccountSchema,
  workspaceSchema
} from "@postflow/shared";
import { publishQueue } from "./queue";

const app = Fastify({
  logger: {
    transport: env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined
  }
});

app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
app.register(rateLimit, { max: 20, timeWindow: "1 minute" });
registerAuth(app);

app.register(swagger, {
  swagger: {
    info: {
      title: "PostFlow API",
      version: "0.1.0"
    }
  }
});
app.register(swaggerUi, { routePrefix: "/docs" });

app.get("/health", async () => ({ status: "ok" }));
app.get("/metrics", async () => ({ uptime: process.uptime() }));

const signTokens = (user: { id: string; email: string }) => {
  const accessToken = app.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: "15m" });
  const refreshToken = app.jwt.sign({ sub: user.id, email: user.email }, { secret: env.JWT_REFRESH_SECRET, expiresIn: "7d" });
  return { accessToken, refreshToken };
};

const requireMembership = async (workspaceId: string, userId: string) => {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } }
  });
  if (!membership) {
    throw new Error("FORBIDDEN");
  }
  return membership;
};

const ensureAdmin = (role: string) => {
  if (role === "OWNER" || role === "ADMIN") {
    return;
  }
  throw new Error("FORBIDDEN");
};

const ensureEditor = (role: string) => {
  if (role === "OWNER" || role === "ADMIN" || role === "EDITOR") {
    return;
  }
  throw new Error("FORBIDDEN");
};

app.post("/auth/register", async (request, reply) => {
  const body = registerSchema.parse(request.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return reply.code(409).send({ error: "Email already registered" });
  }
  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({ data: { email: body.email, passwordHash } });
  const tokens = signTokens(user);
  return reply.send({ user: { id: user.id, email: user.email }, ...tokens });
});

app.post("/auth/login", async (request, reply) => {
  const body = loginSchema.parse(request.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    return reply.code(401).send({ error: "Invalid credentials" });
  }
  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    return reply.code(401).send({ error: "Invalid credentials" });
  }
  const tokens = signTokens(user);
  return reply.send({ user: { id: user.id, email: user.email }, ...tokens });
});

app.post("/auth/refresh", async (request, reply) => {
  const body = z.object({ refreshToken: z.string() }).parse(request.body);
  try {
    const payload = app.jwt.verify(body.refreshToken, { secret: env.JWT_REFRESH_SECRET }) as { sub: string; email: string };
    const tokens = signTokens({ id: payload.sub, email: payload.email });
    return reply.send(tokens);
  } catch (error) {
    return reply.code(401).send({ error: "Invalid refresh token" });
  }
});

app.post("/auth/logout", async (_request, reply) => {
  return reply.send({ ok: true });
});

app.get("/workspaces", { preHandler: [app.authenticate] }, async (request) => {
  const userId = request.user.sub;
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true }
  });
  return memberships.map((membership) => ({
    id: membership.workspace.id,
    name: membership.workspace.name,
    role: membership.role
  }));
});

app.post("/workspaces", { preHandler: [app.authenticate] }, async (request, reply) => {
  const body = workspaceSchema.parse(request.body);
  const userId = request.user.sub;
  const workspace = await prisma.workspace.create({
    data: {
      name: body.name,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "OWNER"
        }
      }
    }
  });
  return reply.send(workspace);
});

app.get("/workspaces/:id/members", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const userId = request.user.sub;
  try {
    await requireMembership(params.id, userId);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const members = await prisma.workspaceMember.findMany({ where: { workspaceId: params.id }, include: { user: true } });
  return members.map((member) => ({ id: member.id, email: member.user.email, role: member.role }));
});

app.post("/workspaces/:id/members", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const body = z.object({ email: z.string().email(), role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"]) }).parse(request.body);
  const userId = request.user.sub;
  try {
    const membership = await requireMembership(params.id, userId);
    ensureAdmin(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    return reply.code(404).send({ error: "User not found" });
  }
  const member = await prisma.workspaceMember.create({
    data: { workspaceId: params.id, userId: user.id, role: body.role }
  });
  return reply.send(member);
});

app.patch("/workspaces/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const body = workspaceSchema.parse(request.body);
  const userId = request.user.sub;
  try {
    const membership = await requireMembership(params.id, userId);
    ensureAdmin(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const workspace = await prisma.workspace.update({ where: { id: params.id }, data: { name: body.name } });
  return reply.send(workspace);
});

app.post("/social-accounts", { preHandler: [app.authenticate] }, async (request, reply) => {
  const body = socialAccountSchema.parse(request.body);
  const userId = request.user.sub;
  const workspaceId = z.object({ workspaceId: z.string().uuid() }).parse(request.query).workspaceId;
  try {
    const membership = await requireMembership(workspaceId, userId);
    ensureAdmin(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const adapter = platformAdapters[body.platform];
  const validation = await adapter.validateCredentials(body.credentials);
  const account = await prisma.socialAccount.create({
    data: {
      workspaceId,
      platform: body.platform,
      displayName: body.displayName,
      externalId: body.externalId,
      credentialsEncrypted: encryptJson(body.credentials),
      capabilitiesJson: adapter.getCapabilities(),
      status: validation.valid ? "ACTIVE" : "ERROR"
    }
  });
  return reply.send({ ...account, validation });
});

app.get("/social-accounts", { preHandler: [app.authenticate] }, async (request, reply) => {
  const userId = request.user.sub;
  const query = z.object({ workspaceId: z.string().uuid() }).parse(request.query);
  try {
    await requireMembership(query.workspaceId, userId);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const accounts = await prisma.socialAccount.findMany({ where: { workspaceId: query.workspaceId } });
  return accounts;
});

app.post("/social-accounts/:id/validate", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const account = await prisma.socialAccount.findUnique({ where: { id: params.id } });
  if (!account) {
    return reply.code(404).send({ error: "Not found" });
  }
  try {
    const membership = await requireMembership(account.workspaceId, request.user.sub);
    ensureAdmin(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const credentials = decryptJson(account.credentialsEncrypted);
  const adapter = platformAdapters[account.platform];
  const validation = await adapter.validateCredentials(credentials);
  await prisma.socialAccount.update({
    where: { id: account.id },
    data: { status: validation.valid ? "ACTIVE" : "ERROR" }
  });
  return reply.send(validation);
});

app.delete("/social-accounts/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const account = await prisma.socialAccount.findUnique({ where: { id: params.id } });
  if (!account) {
    return reply.code(404).send({ error: "Not found" });
  }
  try {
    const membership = await requireMembership(account.workspaceId, request.user.sub);
    ensureAdmin(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  await prisma.socialAccount.delete({ where: { id: account.id } });
  return reply.send({ ok: true });
});

app.post("/posts", { preHandler: [app.authenticate] }, async (request, reply) => {
  const body = postSchema.parse(request.body);
  const userId = request.user.sub;
  const workspaceId = z.object({ workspaceId: z.string().uuid() }).parse(request.query).workspaceId;
  try {
    const membership = await requireMembership(workspaceId, userId);
    ensureEditor(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const post = await prisma.post.create({
    data: {
      workspaceId,
      title: body.title,
      baseText: body.baseText,
      createdBy: userId
    }
  });
  await prisma.auditLog.create({
    data: {
      workspaceId,
      actorId: userId,
      action: "create",
      entity: "post",
      entityId: post.id,
      metaJson: { title: post.title }
    }
  });
  return reply.send(post);
});

app.get("/posts", { preHandler: [app.authenticate] }, async (request, reply) => {
  const userId = request.user.sub;
  const query = z.object({ workspaceId: z.string().uuid() }).parse(request.query);
  try {
    await requireMembership(query.workspaceId, userId);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const posts = await prisma.post.findMany({ where: { workspaceId: query.workspaceId }, include: { targets: true } });
  return posts;
});

app.get("/posts/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { targets: { include: { attempts: true, socialAccount: true } } }
  });
  if (!post) {
    return reply.code(404).send({ error: "Not found" });
  }
  try {
    await requireMembership(post.workspaceId, request.user.sub);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  return reply.send(post);
});

app.delete("/posts/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) {
    return reply.code(404).send({ error: "Not found" });
  }
  try {
    const membership = await requireMembership(post.workspaceId, request.user.sub);
    ensureEditor(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  await prisma.postTarget.deleteMany({ where: { postId: params.id } });
  await prisma.post.delete({ where: { id: params.id } });
  return reply.send({ ok: true });
});

app.post("/posts/:id/targets", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const body = postTargetSchema.parse(request.body);
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) {
    return reply.code(404).send({ error: "Post not found" });
  }
  try {
    const membership = await requireMembership(post.workspaceId, request.user.sub);
    ensureEditor(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const target = await prisma.postTarget.create({
    data: {
      postId: post.id,
      socialAccountId: body.socialAccountId,
      overrideText: body.overrideText,
      payloadJson: body.payload ?? {}
    }
  });
  return reply.send(target);
});

app.post("/targets/:id/schedule", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const body = scheduleSchema.parse(request.body);
  const scheduledAt = new Date(body.scheduledAt);
  const existing = await prisma.postTarget.findUnique({ where: { id: params.id }, include: { post: true } });
  if (!existing) {
    return reply.code(404).send({ error: "Not found" });
  }
  try {
    const membership = await requireMembership(existing.post.workspaceId, request.user.sub);
    ensureEditor(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const target = await prisma.postTarget.update({
    where: { id: params.id },
    data: { scheduledAt, status: "SCHEDULED" }
  });
  const jobId = `publish:${target.id}`;
  await publishQueue.add(
    "publish",
    { postTargetId: target.id, scheduledAt: scheduledAt.toISOString() },
    {
      jobId,
      delay: Math.max(0, scheduledAt.getTime() - Date.now()),
      attempts: 3,
      backoff: { type: "exponential", delay: 30000 }
    }
  );
  return reply.send(target);
});

app.post("/targets/:id/publish-now", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const scheduledAt = new Date();
  const existing = await prisma.postTarget.findUnique({ where: { id: params.id }, include: { post: true } });
  if (!existing) {
    return reply.code(404).send({ error: "Not found" });
  }
  try {
    const membership = await requireMembership(existing.post.workspaceId, request.user.sub);
    ensureEditor(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const target = await prisma.postTarget.update({
    where: { id: params.id },
    data: { scheduledAt, status: "SCHEDULED" }
  });
  const jobId = `publish:${target.id}`;
  await publishQueue.add(
    "publish",
    { postTargetId: target.id, scheduledAt: scheduledAt.toISOString() },
    { jobId, delay: 0, attempts: 3, backoff: { type: "exponential", delay: 30000 } }
  );
  return reply.send(target);
});

app.post("/targets/:id/cancel", { preHandler: [app.authenticate] }, async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const existing = await prisma.postTarget.findUnique({ where: { id: params.id }, include: { post: true } });
  if (!existing) {
    return reply.code(404).send({ error: "Not found" });
  }
  try {
    const membership = await requireMembership(existing.post.workspaceId, request.user.sub);
    ensureEditor(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const target = await prisma.postTarget.update({
    where: { id: params.id },
    data: { status: "CANCELED" }
  });
  const jobId = `publish:${target.id}`;
  const job = await publishQueue.getJob(jobId);
  if (job) {
    await job.remove();
  }
  return reply.send(target);
});

app.get("/calendar", { preHandler: [app.authenticate] }, async (request, reply) => {
  const query = z
    .object({
      workspaceId: z.string().uuid(),
      from: z.string().datetime(),
      to: z.string().datetime()
    })
    .parse(request.query);
  try {
    await requireMembership(query.workspaceId, request.user.sub);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const targets = await prisma.postTarget.findMany({
    where: {
      post: { workspaceId: query.workspaceId },
      scheduledAt: {
        gte: new Date(query.from),
        lte: new Date(query.to)
      }
    },
    include: { post: true, socialAccount: true }
  });
  return targets;
});

app.get("/audit-logs", { preHandler: [app.authenticate] }, async (request, reply) => {
  const query = z
    .object({
      workspaceId: z.string().uuid(),
      limit: z.coerce.number().min(1).max(200).default(50)
    })
    .parse(request.query);
  try {
    await requireMembership(query.workspaceId, request.user.sub);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const logs = await prisma.auditLog.findMany({
    where: { workspaceId: query.workspaceId },
    orderBy: { createdAt: "desc" },
    take: query.limit
  });
  return logs;
});

app.post("/media", { preHandler: [app.authenticate] }, async (request, reply) => {
  const body = z
    .object({
      workspaceId: z.string().uuid(),
      type: z.string(),
      url: z.string().url(),
      meta: z.record(z.string(), z.unknown()).default({})
    })
    .parse(request.body);
  try {
    const membership = await requireMembership(body.workspaceId, request.user.sub);
    ensureEditor(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const asset = await prisma.mediaAsset.create({
    data: {
      workspaceId: body.workspaceId,
      type: body.type,
      url: body.url,
      metaJson: body.meta,
      createdBy: request.user.sub
    }
  });
  return reply.send(asset);
});

app.post("/media/presign", { preHandler: [app.authenticate] }, async (request, reply) => {
  const body = z
    .object({
      workspaceId: z.string().uuid(),
      fileName: z.string().min(1),
      contentType: z.string().min(1)
    })
    .parse(request.body);
  try {
    const membership = await requireMembership(body.workspaceId, request.user.sub);
    ensureEditor(membership.role);
  } catch {
    return reply.code(403).send({ error: "Forbidden" });
  }
  const safeName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${body.workspaceId}/${Date.now()}_${safeName}`;
  const presign = await createPresignedUpload(key, body.contentType);
  return reply.send(presign);
});

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  return reply.code(500).send({ error: "Internal Server Error" });
});

const start = async () => {
  await app.listen({ port: Number(env.PORT), host: "0.0.0.0" });
};

start();
