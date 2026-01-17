import fetch from "node-fetch";
import { env } from "../env";
import { platformCapabilityMatrix } from "@postflow/shared";
import { PlatformAdapter, PublishPayload } from "./types";

const vkRequest = async (method: string, params: Record<string, string>) => {
  const query = new URLSearchParams({ ...params, v: env.VK_API_VERSION }).toString();
  const response = await fetch(`${env.VK_API_BASE}/method/${method}?${query}`);
  if (!response.ok) {
    throw new Error(`VK API error ${response.status}`);
  }
  const data = (await response.json()) as { response?: { post_id: number }; error?: { error_msg: string } };
  if (data.error) {
    throw new Error(data.error.error_msg);
  }
  return data.response;
};

export const vkAdapter: PlatformAdapter = {
  async validateCredentials(credentials) {
    if (env.MOCK_PLATFORMS === "true") {
      return { valid: true, details: "Mocked" };
    }
    try {
      await vkRequest("users.get", { access_token: credentials.token });
      return { valid: true, details: "OK" };
    } catch (error) {
      return { valid: false, details: error instanceof Error ? error.message : "Invalid" };
    }
  },
  getCapabilities() {
    return platformCapabilityMatrix.vk;
  },
  async publish(payload: PublishPayload) {
    if (env.MOCK_PLATFORMS === "true") {
      return { externalPostId: `vk_${Date.now()}` };
    }
    const ownerId = payload.targetExternalId;
    const response = await vkRequest("wall.post", {
      owner_id: ownerId,
      message: payload.text,
      access_token: payload.credentials.token
    });
    return { externalPostId: String(response?.post_id ?? Date.now()) };
  },
  async getStatus(externalPostId: string) {
    return { status: externalPostId ? "published" : "unknown" };
  },
  async delete() {
    return;
  }
};
