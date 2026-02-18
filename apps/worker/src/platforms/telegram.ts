import fetch from "node-fetch";
import { env } from "../env";
import { platformCapabilityMatrix } from "@postflow/shared";
import { PlatformAdapter, PublishPayload } from "./types";

const buildUrl = (token: string, method: string) => `${env.TELEGRAM_API_BASE}/bot${token}/${method}`;

export const telegramAdapter: PlatformAdapter = {
  async validateCredentials(credentials) {
    if (env.MOCK_PLATFORMS === "true") {
      return { valid: true, details: "Mocked" };
    }
    const response = await fetch(buildUrl(credentials.token, "getMe"));
    if (!response.ok) {
      return { valid: false, details: `HTTP ${response.status}` };
    }
    const payload = (await response.json()) as { ok: boolean };
    return { valid: payload.ok, details: payload.ok ? "OK" : "Invalid token" };
  },
  getCapabilities() {
    return platformCapabilityMatrix.telegram;
  },
  async publish(payload: PublishPayload) {
    if (env.MOCK_PLATFORMS === "true") {
      return { externalPostId: `tg_${Date.now()}` };
    }
    const chatId = payload.targetExternalId;
    if (payload.mediaUrls && payload.mediaUrls.length > 0) {
      const media = payload.mediaUrls.map((url, index) => ({
        type: url.endsWith(".mp4") ? "video" : "photo",
        media: url,
        caption: index === 0 ? payload.text : undefined
      }));
      const res = await fetch(buildUrl(payload.credentials.token, "sendMediaGroup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, media })
      });
      if (!res.ok) {
        throw new Error(`Telegram publish failed: ${res.status}`);
      }
      const data = (await res.json()) as { result: Array<{ message_id: number }> };
      return { externalPostId: String(data.result?.[0]?.message_id ?? Date.now()) };
    }
    const res = await fetch(buildUrl(payload.credentials.token, "sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: payload.text })
    });
    if (!res.ok) {
      throw new Error(`Telegram publish failed: ${res.status}`);
    }
    const data = (await res.json()) as { result: { message_id: number } };
    return { externalPostId: String(data.result.message_id) };
  },
  async getStatus(externalPostId: string) {
    return { status: externalPostId ? "published" : "unknown" };
  },
  async delete() {
    return;
  }
};
