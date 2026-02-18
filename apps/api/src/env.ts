import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  REDIS_URL: z.string().url(),
  MINIO_ENDPOINT: z.string().url(),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_BUCKET: z.string().min(1),
  MINIO_REGION: z.string().default("us-east-1"),
  MINIO_PUBLIC_BASE_URL: z.string().url().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  TELEGRAM_API_BASE: z.string().default("https://api.telegram.org"),
  VK_API_BASE: z.string().default("https://api.vk.com"),
  VK_API_VERSION: z.string().default("5.199"),
  MOCK_PLATFORMS: z.string().default("false")
});

export const env = envSchema.parse(process.env);
