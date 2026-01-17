export const QUEUE_NAMES = {
  publish: "postflow:publish"
} as const;

export type PublishJobPayload = {
  postTargetId: string;
  scheduledAt: string;
};
