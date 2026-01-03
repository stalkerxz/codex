export type Level = {
  id: number;
  title: string;
  targetEV: number;
  prompt: string;
  hint: string;
};

export type CameraSettings = {
  iso: number;
  aperture: number;
  shutterSpeed: number;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const calculateEV = ({ iso, aperture, shutterSpeed }: CameraSettings) => {
  const baseEV = Math.log2((aperture * aperture) / shutterSpeed);
  const isoComp = Math.log2(iso / 100);
  return baseEV - isoComp;
};

export const exposureDelta = (settings: CameraSettings, targetEV: number) =>
  calculateEV(settings) - targetEV;

export const scoreShot = (delta: number) => {
  const absolute = Math.abs(delta);
  if (absolute < 0.3) return 3;
  if (absolute < 0.7) return 2;
  if (absolute < 1.2) return 1;
  return 0;
};
