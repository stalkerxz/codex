import crypto from "crypto";
import { env } from "./env";

const key = Buffer.from(env.ENCRYPTION_KEY, "utf8").subarray(0, 32);

export const decryptJson = (token: string): Record<string, string> => {
  const [ivB64, tagB64, dataB64] = token.split(".");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
};
