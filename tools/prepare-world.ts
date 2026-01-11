import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const CONFIG_PATH = path.resolve("tools/world-config.json");
const OUTPUT_DIR = path.resolve("public/data_generated");

type WorldConfig = {
  bbox: {
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
  };
  resolution: number;
  demSource: "srtm30m" | "copernicus";
};

type PrepareOptions = WorldConfig & {
  outDir: string;
};

async function loadConfig(): Promise<PrepareOptions> {
  const file = await fs.readFile(CONFIG_PATH, "utf-8");
  const config = JSON.parse(file) as WorldConfig;
  return {
    ...config,
    outDir: OUTPUT_DIR
  };
}

async function main() {
  const args = process.argv.slice(2);
  const config = await loadConfig();
  const options: PrepareOptions = { ...config };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--bbox" && args[i + 1]) {
      const [minLat, minLon, maxLat, maxLon] = args[i + 1].split(",").map(Number);
      options.bbox = { minLat, minLon, maxLat, maxLon };
      i += 1;
    }
    if (arg === "--resolution" && args[i + 1]) {
      options.resolution = Number(args[i + 1]);
      i += 1;
    }
    if (arg === "--out" && args[i + 1]) {
      options.outDir = path.resolve(args[i + 1]);
      i += 1;
    }
  }

  await fs.mkdir(options.outDir, { recursive: true });
  console.log("Preparing world data...");

  const { heightmap, metadata } = await buildHeightmap(options);
  await writeHeightmapPng(path.join(options.outDir, "heightmap.png"), heightmap, metadata);
  await fs.writeFile(
    path.join(options.outDir, "metadata.json"),
    JSON.stringify(metadata, null, 2)
  );

  const { pistes, lifts } = await buildOSM(options);
  await fs.writeFile(
    path.join(options.outDir, "pistes.geojson"),
    JSON.stringify(pistes, null, 2)
  );
  await fs.writeFile(
    path.join(options.outDir, "lifts.geojson"),
    JSON.stringify(lifts, null, 2)
  );

  console.log("World data prepared:", options.outDir);
}

async function buildHeightmap(options: PrepareOptions) {
  try {
    const heightmap = await fetchHeights(options.bbox, options.resolution);
    const metadata = buildMeta(options, heightmap);
    return { heightmap, metadata };
  } catch (error) {
    console.warn("Failed to fetch DEM, using fallback.", error);
    const heightmap = generateFallbackHeightmap(options.resolution);
    const metadata = buildMeta(options, heightmap, "fallback");
    return { heightmap, metadata };
  }
}

async function buildOSM(options: PrepareOptions) {
  try {
    const geojson = await fetchOSM(options.bbox);
    return geojson;
  } catch (error) {
    console.warn("Failed to fetch OSM, using fallback.", error);
    return fallbackGeojson();
  }
}

async function fetchHeights(bbox: PrepareOptions["bbox"], resolution: number) {
  const { minLat, minLon, maxLat, maxLon } = bbox;
  const points: { lat: number; lon: number }[] = [];
  for (let y = 0; y < resolution; y += 1) {
    const t = y / (resolution - 1);
    const lat = minLat + t * (maxLat - minLat);
    for (let x = 0; x < resolution; x += 1) {
      const s = x / (resolution - 1);
      const lon = minLon + s * (maxLon - minLon);
      points.push({ lat, lon });
    }
  }

  const elevations: number[] = [];
  const batchSize = 100;
  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);
    const locations = batch
      .map((p) => `${p.lat.toFixed(6)},${p.lon.toFixed(6)}`)
      .join("|");
    const url = `https://api.opentopodata.org/v1/srtm30m?locations=${locations}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch elevation: ${response.statusText}`);
    }
    const data = (await response.json()) as {
      results: { elevation: number | null }[];
    };
    for (const result of data.results) {
      elevations.push(result.elevation ?? 0);
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  return {
    resolution,
    heights: elevations
  };
}

function generateFallbackHeightmap(resolution: number) {
  const heights: number[] = [];
  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      const t = 1 - y / (resolution - 1);
      heights.push(450 + t * 150);
    }
  }
  return {
    resolution,
    heights
  };
}

function buildMeta(options: PrepareOptions, heightmap: { resolution: number; heights: number[] }, sourceOverride?: string) {
  const min = Math.min(...heightmap.heights);
  const max = Math.max(...heightmap.heights);
  return {
    bbox: options.bbox,
    minElevation: min,
    maxElevation: max,
    source: sourceOverride ?? options.demSource,
    heightmapResolution: {
      width: heightmap.resolution,
      height: heightmap.resolution
    }
  };
}

async function writeHeightmapPng(
  filePath: string,
  heightmap: { resolution: number; heights: number[] },
  meta: ReturnType<typeof buildMeta>
) {
  const { resolution, heights } = heightmap;
  const rows: Buffer[] = [];
  for (let y = 0; y < resolution; y += 1) {
    const row = Buffer.alloc(1 + resolution);
    row[0] = 0;
    for (let x = 0; x < resolution; x += 1) {
      const value = heights[y * resolution + x];
      const t = (value - meta.minElevation) / (meta.maxElevation - meta.minElevation || 1);
      row[1 + x] = Math.max(0, Math.min(255, Math.round(t * 255)));
    }
    rows.push(row);
  }
  const raw = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw);
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", buildIHDR(resolution, resolution)),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
  await fs.writeFile(filePath, png);
}

function buildIHDR(width: number, height: number) {
  const buffer = Buffer.alloc(13);
  buffer.writeUInt32BE(width, 0);
  buffer.writeUInt32BE(height, 4);
  buffer.writeUInt8(8, 8);
  buffer.writeUInt8(0, 9);
  buffer.writeUInt8(0, 10);
  buffer.writeUInt8(0, 11);
  buffer.writeUInt8(0, 12);
  return buffer;
}

function pngChunk(type: string, data: Buffer) {
  const chunkType = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  const crcValue = crc32(Buffer.concat([chunkType, data]));
  crc.writeUInt32BE(crcValue, 0);
  return Buffer.concat([length, chunkType, data, crc]);
}

function crc32(data: Buffer) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function fetchOSM(bbox: PrepareOptions["bbox"]) {
  const { minLat, minLon, maxLat, maxLon } = bbox;
  const query = `
    [out:json][timeout:50];
    (
      way["piste:type"~"downhill|nordic"](${minLat},${minLon},${maxLat},${maxLon});
      way["aerialway"](${minLat},${minLon},${maxLat},${maxLon});
    );
    out geom;
  `;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain" }
  });
  if (!response.ok) {
    throw new Error(`Overpass error: ${response.statusText}`);
  }
  const data = (await response.json()) as {
    elements: {
      id: number;
      type: string;
      tags?: Record<string, string>;
      geometry?: { lat: number; lon: number }[];
    }[];
  };

  const pisteFeatures = [] as GeoJSONFeatureCollection["features"];
  const liftFeatures = [] as GeoJSONFeatureCollection["features"];

  for (const element of data.elements) {
    if (element.type !== "way" || !element.geometry) continue;
    const tags = element.tags ?? {};
    const kind = tags["aerialway"] ? "lift" : "piste";
    const feature = {
      type: "Feature",
      id: `${kind}-${element.id}`,
      properties: {
        name: tags.name ?? "",
        kind
      },
      geometry: {
        type: "LineString",
        coordinates: element.geometry.map((point) => [point.lon, point.lat])
      }
    };
    if (kind === "lift") {
      liftFeatures.push(feature);
    } else {
      pisteFeatures.push(feature);
    }
  }

  return {
    pistes: { type: "FeatureCollection", features: pisteFeatures },
    lifts: { type: "FeatureCollection", features: liftFeatures }
  };
}

function fallbackGeojson() {
  return {
    pistes: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "fallback-piste",
          properties: { name: "Fallback Run", kind: "piste" },
          geometry: {
            type: "LineString",
            coordinates: [
              [87.95, 52.955],
              [87.948, 52.95],
              [87.946, 52.945],
              [87.945, 52.94]
            ]
          }
        }
      ]
    },
    lifts: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "fallback-lift",
          properties: { name: "Fallback Lift", kind: "lift" },
          geometry: {
            type: "LineString",
            coordinates: [
              [87.945, 52.94],
              [87.947, 52.948],
              [87.95, 52.955]
            ]
          }
        }
      ]
    }
  };
}

type GeoJSONFeatureCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    id?: string;
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
