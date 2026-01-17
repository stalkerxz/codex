import { Platform } from "@prisma/client";
import { telegramAdapter } from "./telegram";
import { vkAdapter } from "./vk";
import { instagramAdapter } from "./instagram";
import { PlatformAdapter } from "./types";

export const platformAdapters: Record<Platform, PlatformAdapter> = {
  telegram: telegramAdapter,
  vk: vkAdapter,
  instagram: instagramAdapter
};
