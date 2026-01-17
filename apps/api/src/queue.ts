import { Queue } from "bullmq";
import { env } from "./env";
import { QUEUE_NAMES, PublishJobPayload } from "@postflow/shared";

export const publishQueue = new Queue<PublishJobPayload>(QUEUE_NAMES.publish, {
  connection: {
    url: env.REDIS_URL
  }
});
