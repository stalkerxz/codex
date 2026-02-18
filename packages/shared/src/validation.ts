import { z } from "zod";
import { Platform } from "./platforms";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const loginSchema = registerSchema;

export const workspaceSchema = z.object({
  name: z.string().min(2)
});

export const socialAccountSchema = z.object({
  platform: z.enum(["telegram", "vk", "instagram"] satisfies [Platform, Platform, Platform]),
  displayName: z.string().min(1),
  externalId: z.string().min(1),
  credentials: z.record(z.string(), z.string())
});

export const postSchema = z.object({
  title: z.string().min(1),
  baseText: z.string().min(1)
});

export const postTargetSchema = z.object({
  socialAccountId: z.string().uuid(),
  overrideText: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional()
});

export const scheduleSchema = z.object({
  scheduledAt: z.string().datetime()
});
