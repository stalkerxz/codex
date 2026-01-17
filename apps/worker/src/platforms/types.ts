import { PlatformCapabilities } from "@postflow/shared";

export type PlatformAdapter = {
  validateCredentials: (credentials: Record<string, string>) => Promise<{ valid: boolean; details?: string }>;
  getCapabilities: () => PlatformCapabilities;
  publish: (payload: PublishPayload) => Promise<{ externalPostId: string }>;
  getStatus: (externalPostId: string) => Promise<{ status: string }>;
  delete: (externalPostId: string) => Promise<void>;
};

export type PublishPayload = {
  text: string;
  mediaUrls?: string[];
  buttons?: { label: string; url: string }[];
  poll?: { question: string; options: string[] };
  link?: string;
  targetExternalId: string;
  credentials: Record<string, string>;
};
