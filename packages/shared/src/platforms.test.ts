import { describe, expect, it } from "vitest";
import { platformCapabilityMatrix } from "./platforms";

describe("platformCapabilityMatrix", () => {
  it("includes telegram and vk capabilities", () => {
    expect(platformCapabilityMatrix.telegram.text).toBe(true);
    expect(platformCapabilityMatrix.vk.text).toBe(true);
  });
});
