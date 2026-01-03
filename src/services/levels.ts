import { Level } from "./gameEngine";

export const levels: Level[] = [
  {
    id: 1,
    title: "Freeze Motion",
    targetEV: 12,
    prompt:
      "A sprinter bursting off the blocks at dusk, stadium lights flaring, cinematic sports photography, crisp motion",
    hint: "Fast shutter, moderate ISO. Lock the action with precision.",
  },
  {
    id: 2,
    title: "Create Silhouette",
    targetEV: 9,
    prompt:
      "A lone traveler standing against a blazing sunset on a ridge, dramatic silhouette, cinematic landscape",
    hint: "Expose for the highlights. Let the subject fall into shadow.",
  },
  {
    id: 3,
    title: "Macro Shot",
    targetEV: 11,
    prompt:
      "Extreme close-up of a dew-covered leaf with shimmering bokeh, ultra-detailed macro photography",
    hint: "Wide aperture for bokeh, watch your focus plane.",
  },
];
