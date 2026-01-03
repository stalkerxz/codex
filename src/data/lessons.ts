import { Lesson } from "./types";

export const lessons: Lesson[] = [
  {
    id: "light",
    title: "Lesson 1: The Soul of Photo (Light)",
    concept:
      "Light is the sculptor. It reveals texture, defines depth, and decides whether a photo feels calm, dramatic, or nostalgic.",
    whyItMatters:
      "Soft light wraps gently around a subject and feels tender. Hard light carves sharp edges and increases tension. Knowing which one you have lets you choose the mood, not just accept it.",
    mission:
      "Spend 20 minutes observing natural light in one room. Photograph the same object in three positions: direct window light, near shadow, and deep shade.",
    checklistItems: [
      "Captured a version with direct light and visible highlights.",
      "Captured a version with soft shadow transitions.",
      "Captured a version in deeper shade with muted contrast.",
      "Noted the time of day and how it changed the mood."
    ],
    examplePrompt:
      "A quiet ceramic mug on a wooden table, golden hour light spilling across it, deep shadows trailing behind, cinematic softness."
  },
  {
    id: "composition",
    title: "Lesson 2: Geometry of the Frame (Composition)",
    concept:
      "Composition is how you place visual weight. The frame is a stage, and every line or shape either supports the story or distracts from it.",
    whyItMatters:
      "Strong geometry makes images feel intentional. When the eye knows where to land and how to travel, the photo feels confident instead of chaotic.",
    mission:
      "Find a street or hallway with clear lines. Compose two images: one using the rule of thirds, one using leading lines to pull the eye.",
    checklistItems: [
      "Subject placed on a third with breathing space.",
      "Used a line or edge to guide the viewer toward the subject.",
      "Removed one distracting element from the frame.",
      "Compared the emotional difference between the two shots."
    ],
    examplePrompt:
      "A long corridor with repeating lights, a lone figure placed on the right third, leading lines pulling toward them, stark monochrome tones."
  },
  {
    id: "focus",
    title: "Lesson 3: The Point of Interest (Focus & Subject)",
    concept:
      "A photograph needs a clear subject. Focus is the tool that signals what matters most and what fades into supporting detail.",
    whyItMatters:
      "When focus is deliberate, the viewer feels guided. When it is vague, the image feels undecided. Focus is the promise of clarity.",
    mission:
      "Choose one small subject (leaf, cup, or hand). Shoot it three ways: tight detail, mid-range with context, and wide with environment.",
    checklistItems: [
      "Subject is tack-sharp in at least one frame.",
      "Background elements are simplified or softened.",
      "One image reveals context without stealing attention.",
      "You can explain why the subject matters in one sentence."
    ],
    examplePrompt:
      "Close-up of a weathered book spine in sharp focus, soft blurred shelves behind it, warm muted tones, intimate atmosphere."
  },
  {
    id: "perspective",
    title: "Lesson 4: Perspective & Angle",
    concept:
      "Perspective is the storyteller. A high angle can make a subject feel small or observational, while a low angle can make it heroic or imposing.",
    whyItMatters:
      "Angle changes the power dynamic. It also changes the shape of the scene, revealing lines or patterns you cannot see from eye level.",
    mission:
      "Photograph a familiar object from three heights: above, eye level, and ground level. Keep the subject centered in each.",
    checklistItems: [
      "Shot one angle that feels vulnerable or quiet.",
      "Shot one angle that feels strong or bold.",
      "Noticed how background shapes changed with height."
    ],
    examplePrompt:
      "Low-angle photo of a cyclist against open sky, dramatic perspective, strong lines, minimal palette with electric blue accent."
  },
  {
    id: "color",
    title: "Lesson 5: Color & Contrast",
    concept:
      "Color contrast creates energy. Complementary colors, like blue and orange, push against each other and make a scene pop without extra clutter.",
    whyItMatters:
      "Controlled contrast guides attention and sets tone. Subtle contrast feels calm; bold contrast feels alive and cinematic.",
    mission:
      "Find a complementary color pair in the real world. Photograph it once with balanced exposure and once with deeper shadows for drama.",
    checklistItems: [
      "Captured two dominant complementary colors.",
      "Adjusted framing to reduce competing colors.",
      "Created one version with balanced contrast.",
      "Created one version with deeper shadows."
    ],
    examplePrompt:
      "A teal door with an orange bicycle leaning against it, strong color contrast, soft overcast light, minimalist urban scene."
  }
];
