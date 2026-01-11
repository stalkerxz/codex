import overrides from "../data/overrides.json";

export type TerrainMeta = {
  bbox: {
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
  };
  minElevation: number;
  maxElevation: number;
  source: string;
  heightmapResolution: {
    width: number;
    height: number;
  };
};

export type TerrainData = {
  meta: TerrainMeta;
  heightmap: Float32Array;
  width: number;
  height: number;
};

export type PisteFeature = {
  id: string;
  name: string;
  type: "piste" | "lift" | "building" | "road";
  coordinates: [number, number][];
};

export type WorldData = {
  terrain: TerrainData;
  features: PisteFeature[];
  hasGeneratedData: boolean;
};

const fallbackMeta: TerrainMeta = {
  bbox: {
    minLat: 52.91,
    minLon: 87.88,
    maxLat: 52.96,
    maxLon: 88.02
  },
  minElevation: 450,
  maxElevation: 900,
  source: "Fallback flat slope",
  heightmapResolution: {
    width: 64,
    height: 64
  }
};

const GENERATED_PATH = "/data_generated";

export async function loadWorld(): Promise<WorldData> {
  try {
    const metadata = await fetchJson<TerrainMeta>(`${GENERATED_PATH}/metadata.json`);
    const heightmapImage = await loadImage(`${GENERATED_PATH}/heightmap.png`);
    const [pistes, lifts] = await Promise.all([
      fetchJson<GeoJSONFeatureCollection>(`${GENERATED_PATH}/pistes.geojson`),
      fetchJson<GeoJSONFeatureCollection>(`${GENERATED_PATH}/lifts.geojson`)
    ]);
    const terrain = decodeHeightmap(heightmapImage, metadata);
    const features = buildFeatures([pistes, lifts]);
    return {
      terrain,
      features: mergeOverrides(features),
      hasGeneratedData: true
    };
  } catch (error) {
    console.warn("Generated world data missing, using fallback.", error);
    const terrain = buildFallbackTerrain();
    const features = mergeOverrides(buildFallbackFeatures());
    return {
      terrain,
      features,
      hasGeneratedData: false
    };
  }
}

function buildFallbackTerrain(): TerrainData {
  const { width, height } = fallbackMeta.heightmapResolution;
  const heightmap = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const t = 1 - y / (height - 1);
      heightmap[y * width + x] = fallbackMeta.minElevation + t * 120;
    }
  }
  return {
    meta: fallbackMeta,
    heightmap,
    width,
    height
  };
}

function buildFallbackFeatures(): PisteFeature[] {
  return [
    {
      id: "fallback-piste",
      name: "Fallback Run",
      type: "piste",
      coordinates: [
        [52.955, 87.95],
        [52.95, 87.948],
        [52.945, 87.946],
        [52.94, 87.945]
      ]
    },
    {
      id: "fallback-lift",
      name: "Fallback Lift",
      type: "lift",
      coordinates: [
        [52.94, 87.945],
        [52.948, 87.947],
        [52.955, 87.95]
      ]
    }
  ];
}

function mergeOverrides(features: PisteFeature[]) {
  const overrideFeatures = overrides.features.map((feature) => feature as PisteFeature);
  return [...features, ...overrideFeatures];
}

type GeoJSONFeatureCollection = {
  type: "FeatureCollection";
  features: {
    id?: string | number;
    properties?: {
      name?: string;
      kind?: string;
    };
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
  }[];
};

function buildFeatures(collections: GeoJSONFeatureCollection[]) {
  const features: PisteFeature[] = [];
  for (const collection of collections) {
    for (const feature of collection.features) {
      if (feature.geometry.type !== "LineString") {
        continue;
      }
      const kind = feature.properties?.kind ?? "piste";
      const name = feature.properties?.name ?? "";
      const type = kind === "lift" ? "lift" : kind === "road" ? "road" : kind === "building" ? "building" : "piste";
      features.push({
        id: String(feature.id ?? name ?? Math.random()),
        name,
        type,
        coordinates: feature.geometry.coordinates.map(([lon, lat]) => [lat, lon])
      });
    }
  }
  return features;
}

function decodeHeightmap(image: HTMLImageElement, meta: TerrainMeta): TerrainData {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to read heightmap canvas");
  }
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const heightmap = new Float32Array(image.width * image.height);
  const min = meta.minElevation;
  const max = meta.maxElevation;
  for (let i = 0; i < heightmap.length; i += 1) {
    const value = imageData.data[i * 4];
    const t = value / 255;
    heightmap[i] = min + t * (max - min);
  }
  return {
    meta,
    heightmap,
    width: image.width,
    height: image.height
  };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return (await response.json()) as T;
}

export function latLonToWorld(lat: number, lon: number, meta: TerrainMeta) {
  const { minLat, minLon, maxLat, maxLon } = meta.bbox;
  const centerLat = (minLat + maxLat) / 2;
  const metersPerDegLat = 111_132;
  const metersPerDegLon = 111_320 * Math.cos((centerLat * Math.PI) / 180);
  const widthMeters = (maxLon - minLon) * metersPerDegLon;
  const heightMeters = (maxLat - minLat) * metersPerDegLat;
  const x = (lon - minLon) * metersPerDegLon - widthMeters / 2;
  const z = (lat - minLat) * metersPerDegLat - heightMeters / 2;
  return { x, z, widthMeters, heightMeters };
}

export function worldToLatLon(x: number, z: number, meta: TerrainMeta) {
  const { minLat, minLon, maxLat, maxLon } = meta.bbox;
  const centerLat = (minLat + maxLat) / 2;
  const metersPerDegLat = 111_132;
  const metersPerDegLon = 111_320 * Math.cos((centerLat * Math.PI) / 180);
  const widthMeters = (maxLon - minLon) * metersPerDegLon;
  const heightMeters = (maxLat - minLat) * metersPerDegLat;
  const lon = minLon + (x + widthMeters / 2) / metersPerDegLon;
  const lat = minLat + (z + heightMeters / 2) / metersPerDegLat;
  return { lat, lon };
}
