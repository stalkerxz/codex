import { describe, it, expect } from "vitest";
import { evaluateSettings, scoreAttempt } from "../src/index.js";

const baseSettings = {
  iso: 200,
  aperture: 2.8,
  shutter: 1 / 125,
  focalLength: 50,
  distance: 2,
  mode: "M" as const,
  exposureComp: 0,
  metering: "matrix" as const,
  wbKelvin: 5600,
  wbTint: 0,
  sensor: "full-frame" as const,
  subjectSpeed: 1,
  cameraSpeed: 0.5,
  lightEV: 9
};

describe("simulator", () => {
  it("computes exposure and warnings", () => {
    const result = evaluateSettings(baseSettings);
    expect(result.ev).toBeTypeOf("number");
    expect(result.histogram).toHaveLength(10);
  });

  it("scores attempt", () => {
    const scored = scoreAttempt(baseSettings, { targetEV: 9, maxBlur: 0.7, maxNoise: 0.7, minDOF: 0.5 });
    expect(scored.score).toBeGreaterThan(0);
  });
});
