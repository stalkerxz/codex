import { Worker, Job } from "bullmq";
import { QUEUE_NAMES, PublishJobPayload } from "@postflow/shared";
import { env } from "./env";
import { prisma } from "./prisma";
import { decryptJson } from "./crypto";
import { platformAdapters } from "./platforms";
import pino from "pino";

const logger = pino({ level: env.NODE_ENV === "development" ? "debug" : "info" });

const logAttempt = async (
  workspaceId: string,
  actorId: string,
  action: string,
  entityId: string,
  meta: Record<string, unknown>
) => {
  await prisma.auditLog.create({
    data: {
      workspaceId,
      actorId,
      action,
      entity: "post_target",
      entityId,
      metaJson: meta
    }
  });
};

const processPublish = async (job: Job<PublishJobPayload>) => {
  const target = await prisma.postTarget.findUnique({
    where: { id: job.data.postTargetId },
    include: { post: true, socialAccount: true }
  });
  if (!target) {
    throw new Error("PostTarget not found");
  }
  if (target.externalPostId) {
    logger.info({ targetId: target.id }, "Skipping publish, already has externalPostId");
    return;
  }

  const attemptNo = job.attemptsMade + 1;
  const attempt = await prisma.publishAttempt.create({
    data: {
      postTargetId: target.id,
      attemptNo,
      status: "STARTED"
    }
  });
  await logAttempt(target.post.workspaceId, target.post.createdBy, "publish_attempt_started", target.id, {
    attemptNo,
    jobId: job.id,
    scheduledAt: job.data.scheduledAt,
    delayMs: job.opts.delay ?? 0,
    maxAttempts: job.opts.attempts ?? 1
  });

  try {
    const credentials = decryptJson(target.socialAccount.credentialsEncrypted);
    const adapter = platformAdapters[target.socialAccount.platform];
    const payloadJson = (target.payloadJson ?? {}) as Record<string, unknown>;
    const mediaUrls = Array.isArray(payloadJson.mediaUrls) ? (payloadJson.mediaUrls as string[]) : undefined;
    const response = await adapter.publish({
      text: target.overrideText ?? target.post.baseText,
      mediaUrls,
      targetExternalId: target.socialAccount.externalId,
      credentials
    });
    await prisma.postTarget.update({
      where: { id: target.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        externalPostId: response.externalPostId,
        lastError: null
      }
    });
    await prisma.publishAttempt.update({
      where: { id: attempt.id },
      data: { status: "SUCCESS", finishedAt: new Date() }
    });
    await logAttempt(target.post.workspaceId, target.post.createdBy, "publish_attempt_succeeded", target.id, {
      attemptNo,
      externalPostId: response.externalPostId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const attempts = job.opts.attempts ?? 1;
    await prisma.publishAttempt.update({
      where: { id: attempt.id },
      data: { status: "FAILED", finishedAt: new Date(), error: message }
    });
    await prisma.postTarget.update({
      where: { id: target.id },
      data: {
        lastError: message,
        status: attemptNo >= attempts ? "FAILED" : "SCHEDULED"
      }
    });
    await logAttempt(target.post.workspaceId, target.post.createdBy, "publish_attempt_failed", target.id, {
      attemptNo,
      error: message,
      willRetry: attemptNo < attempts
    });
    throw error;
  }
};

const worker = new Worker<PublishJobPayload>(
  QUEUE_NAMES.publish,
  async (job) => {
    await processPublish(job);
  },
  {
    connection: { url: env.REDIS_URL }
  }
);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Publish completed");
});

worker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, error: error?.message }, "Publish failed");
});
