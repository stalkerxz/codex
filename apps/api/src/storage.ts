import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

const s3 = new S3Client({
  region: env.MINIO_REGION,
  endpoint: env.MINIO_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY
  }
});

export const createPresignedUpload = async (key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: env.MINIO_BUCKET,
    Key: key,
    ContentType: contentType
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
  const publicBase = env.MINIO_PUBLIC_BASE_URL ?? env.MINIO_ENDPOINT;
  const publicUrl = `${publicBase.replace(/\/$/, "")}/${env.MINIO_BUCKET}/${key}`;
  return { uploadUrl, publicUrl, key };
};
