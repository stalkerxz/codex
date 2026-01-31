import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? "0.0.0.0",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  baseUrl: process.env.BASE_URL ?? "http://localhost:4000",
  s3Endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
  s3Bucket: process.env.S3_BUCKET ?? "media",
  paymentProvider: process.env.PAYMENT_PROVIDER ?? "mock"
};
