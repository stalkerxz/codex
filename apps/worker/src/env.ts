import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  ENCRYPTION_KEY: z.string().min(32),
  TELEGRAM_API_BASE: z.string().default("https://api.telegram.org"),
  VK_API_BASE: z.string().default("https://api.vk.com"),
  VK_API_VERSION: z.string().default("5.199"),
  MOCK_PLATFORMS: z.string().default("false")
});

export const env = envSchema.parse(process.env);
