import { z } from "zod";

export const settingsSchema = z.object({
  iso: z.number().min(50).max(12800),
  aperture: z.number().min(1.2).max(22),
  shutter: z.number().min(1 / 8000).max(30),
  focalLength: z.number().min(14).max(200),
  distance: z.number().min(0.3).max(50),
  mode: z.enum(["M", "A", "S", "P"]),
  exposureComp: z.number().min(-3).max(3),
  metering: z.enum(["matrix", "center", "spot"]),
  wbKelvin: z.number().min(2000).max(9000),
  wbTint: z.number().min(-100).max(100),
  sensor: z.enum(["aps-c", "full-frame", "beginner"]),
  subjectSpeed: z.number().min(0).max(30),
  cameraSpeed: z.number().min(0).max(20),
  lightEV: z.number().min(0).max(15)
});

export type SimulatorSettings = z.infer<typeof settingsSchema>;

export type SimulatorResult = {
  ev: number;
  exposureOffset: number;
  brightness: number;
  noise: number;
  dof: number;
  hyperfocal: number;
  motionBlur: number;
  wbShift: number;
  warnings: string[];
  histogram: number[];
};

const SENSOR_NOISE = {
  "beginner": 1.3,
  "aps-c": 1,
  "full-frame": 0.7
};

export function computeEV(settings: SimulatorSettings) {
  return Math.log2((settings.aperture ** 2) / settings.shutter) - Math.log2(settings.iso / 100);
}

export function computeExposure(settings: SimulatorSettings) {
  const ev = computeEV(settings);
  const target = settings.lightEV + settings.exposureComp;
  const offset = ev - target;
  const brightness = Math.max(0, Math.min(1, 0.5 + offset / 6));
  return { ev, exposureOffset: offset, brightness };
}

export function computeDOF(settings: SimulatorSettings) {
  const coc = settings.sensor === "full-frame" ? 0.03 : settings.sensor === "aps-c" ? 0.02 : 0.025;
  const f = settings.focalLength;
  const N = settings.aperture;
  const s = settings.distance * 1000;
  const hyperfocal = (f * f) / (N * coc) + f;
  const near = (hyperfocal * s) / (hyperfocal + (s - f));
  const far = (hyperfocal * s) / (hyperfocal - (s - f));
  const dof = Math.max(0.05, Math.min(20, (far - near) / 1000));
  return { dof, hyperfocal: hyperfocal / 1000 };
}

export function computeMotionBlur(settings: SimulatorSettings) {
  const relativeSpeed = settings.subjectSpeed + settings.cameraSpeed;
  const blur = relativeSpeed * settings.shutter * 10;
  return Math.min(1, blur / 10);
}

export function computeNoise(settings: SimulatorSettings) {
  const base = (settings.iso / 100) ** 0.6;
  const sensorFactor = SENSOR_NOISE[settings.sensor];
  return Math.min(1, (base * sensorFactor) / 6);
}

export function computeWBShift(settings: SimulatorSettings) {
  const kelvin = settings.wbKelvin;
  const ideal = 5600;
  return Math.min(1, Math.abs(kelvin - ideal) / 4000 + Math.abs(settings.wbTint) / 150);
}

export function computeHistogram(brightness: number) {
  const bins = Array.from({ length: 10 }, (_, i) => {
    const x = i / 9;
    const value = Math.exp(-((x - brightness) ** 2) / 0.08);
    return Math.round(value * 100);
  });
  return bins;
}

export function evaluateSettings(settings: SimulatorSettings): SimulatorResult {
  const exposure = computeExposure(settings);
  const dof = computeDOF(settings);
  const noise = computeNoise(settings);
  const motionBlur = computeMotionBlur(settings);
  const wbShift = computeWBShift(settings);
  const histogram = computeHistogram(exposure.brightness);
  const warnings: string[] = [];

  if (exposure.exposureOffset > 1.2) warnings.push("Пересвет: уменьшите экспозицию или ISO");
  if (exposure.exposureOffset < -1.2) warnings.push("Слишком темно: увеличьте экспозицию");
  if (motionBlur > 0.6) warnings.push("Смаз: увеличьте выдержку или сократите движение");
  if (noise > 0.6) warnings.push("Сильный шум: уменьшите ISO или увеличьте свет");

  return {
    ev: exposure.ev,
    exposureOffset: exposure.exposureOffset,
    brightness: exposure.brightness,
    noise,
    dof: dof.dof,
    hyperfocal: dof.hyperfocal,
    motionBlur,
    wbShift,
    warnings,
    histogram
  };
}

export function scoreAttempt(settings: SimulatorSettings, target: { targetEV: number; maxBlur: number; maxNoise: number; minDOF: number }) {
  const result = evaluateSettings(settings);
  let score = 100;
  const evDiff = Math.abs(result.ev - target.targetEV);
  score -= Math.min(40, evDiff * 10);
  if (result.motionBlur > target.maxBlur) score -= 20;
  if (result.noise > target.maxNoise) score -= 20;
  if (result.dof < target.minDOF) score -= 20;
  score = Math.max(0, Math.round(score));

  const feedback = [
    evDiff > 1 ? "Экспозиция ушла от цели" : "Экспозиция близка к идеалу",
    result.motionBlur > target.maxBlur ? "Есть смаз" : "Движение заморожено",
    result.noise > target.maxNoise ? "Шум выше допустимого" : "Шум в пределах нормы",
    result.dof < target.minDOF ? "Глубина резкости слишком мала" : "Глубина резкости достаточна"
  ].join(". ");

  return { score, result, feedback };
}
