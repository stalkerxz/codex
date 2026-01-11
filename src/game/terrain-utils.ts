import type { TerrainData } from "./data";
import { latLonToWorld } from "./data";

export function getWorldDimensions(meta: TerrainData["meta"]) {
  const { widthMeters, heightMeters } = latLonToWorld(meta.bbox.maxLat, meta.bbox.maxLon, meta);
  return { widthMeters, heightMeters };
}

export function sampleHeight(data: TerrainData, x: number, z: number) {
  const { width, height, heightmap } = data;
  const { widthMeters, heightMeters } = getWorldDimensions(data.meta);
  const halfW = widthMeters / 2;
  const halfH = heightMeters / 2;
  const nx = (x + halfW) / widthMeters;
  const nz = (z + halfH) / heightMeters;
  if (nx < 0 || nx > 1 || nz < 0 || nz > 1) {
    return data.meta.minElevation;
  }
  const ix = nx * (width - 1);
  const iz = nz * (height - 1);
  const x0 = Math.floor(ix);
  const z0 = Math.floor(iz);
  const x1 = Math.min(x0 + 1, width - 1);
  const z1 = Math.min(z0 + 1, height - 1);
  const tx = ix - x0;
  const tz = iz - z0;
  const h00 = heightmap[z0 * width + x0];
  const h10 = heightmap[z0 * width + x1];
  const h01 = heightmap[z1 * width + x0];
  const h11 = heightmap[z1 * width + x1];
  const h0 = h00 * (1 - tx) + h10 * tx;
  const h1 = h01 * (1 - tx) + h11 * tx;
  return h0 * (1 - tz) + h1 * tz;
}

export function sampleNormal(data: TerrainData, x: number, z: number) {
  const delta = 2.5;
  const hL = sampleHeight(data, x - delta, z);
  const hR = sampleHeight(data, x + delta, z);
  const hD = sampleHeight(data, x, z - delta);
  const hU = sampleHeight(data, x, z + delta);
  const nx = hL - hR;
  const ny = 2 * delta;
  const nz = hD - hU;
  const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return { x: nx / length, y: ny / length, z: nz / length };
}
