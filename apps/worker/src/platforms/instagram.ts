import { platformCapabilityMatrix } from "@postflow/shared";
import { PlatformAdapter } from "./types";

export const instagramAdapter: PlatformAdapter = {
  async validateCredentials() {
    return { valid: false, details: "Instagram adapter is not implemented" };
  },
  getCapabilities() {
    return platformCapabilityMatrix.instagram;
  },
  async publish() {
    throw new Error("Instagram adapter is not implemented");
  },
  async getStatus() {
    return { status: "unsupported" };
  },
  async delete() {
    throw new Error("Instagram adapter is not implemented");
  }
};
