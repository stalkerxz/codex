export type Platform = "telegram" | "vk" | "instagram";

export type PlatformCapabilities = {
  text: boolean;
  images: boolean;
  video: boolean;
  albums: boolean;
  buttons: boolean;
  poll: boolean;
  location: boolean;
  hashtags: boolean;
  firstComment: boolean;
  links: boolean;
};

export const platformCapabilityMatrix: Record<Platform, PlatformCapabilities> = {
  telegram: {
    text: true,
    images: true,
    video: true,
    albums: true,
    buttons: true,
    poll: true,
    location: false,
    hashtags: true,
    firstComment: false,
    links: true
  },
  vk: {
    text: true,
    images: true,
    video: true,
    albums: false,
    buttons: false,
    poll: true,
    location: true,
    hashtags: true,
    firstComment: true,
    links: true
  },
  instagram: {
    text: true,
    images: true,
    video: true,
    albums: true,
    buttons: false,
    poll: false,
    location: true,
    hashtags: true,
    firstComment: true,
    links: false
  }
};
