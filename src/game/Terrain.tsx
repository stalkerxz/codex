import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, DoubleSide, MeshStandardMaterial, Vector3 } from "three";
import { latLonToWorld } from "./data";
import type { TerrainData } from "./data";
import type { GraphicsLevel } from "../App";

const SNOW_COLOR = "#f3f6fb";

function buildChunkGeometry(
  data: TerrainData,
  startX: number,
  startY: number,
  chunkSize: number,
  step: number
) {
  const { heightmap, width, height, meta } = data;
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const { widthMeters, heightMeters } = latLonToWorld(meta.bbox.maxLat, meta.bbox.maxLon, meta);
  const scaleX = widthMeters / (width - 1);
  const scaleZ = heightMeters / (height - 1);

  const chunkWidth = Math.floor(chunkSize / step) + 1;
  const chunkHeight = Math.floor(chunkSize / step) + 1;

  for (let y = 0; y < chunkHeight; y += 1) {
    for (let x = 0; x < chunkWidth; x += 1) {
      const srcX = Math.min(startX + x * step, width - 1);
      const srcY = Math.min(startY + y * step, height - 1);
      const index = srcY * width + srcX;
      const heightValue = heightmap[index];
      const worldX = srcX * scaleX - widthMeters / 2;
      const worldZ = srcY * scaleZ - heightMeters / 2;
      vertices.push(worldX, heightValue, worldZ);
      uvs.push(srcX / (width - 1), srcY / (height - 1));
      normals.push(0, 1, 0);
    }
  }

  for (let y = 0; y < chunkHeight - 1; y += 1) {
    for (let x = 0; x < chunkWidth - 1; x += 1) {
      const a = y * chunkWidth + x;
      const b = a + 1;
      const c = a + chunkWidth;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3));
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export default function Terrain({ data, graphics }: { data: TerrainData; graphics: GraphicsLevel }) {
  const chunkSize = graphics === "high" ? 96 : 128;
  const stepLevels = graphics === "low" ? [4, 8, 16] : [2, 4, 8];

  const chunks = useMemo(() => {
    const list: {
      key: string;
      geometries: BufferGeometry[];
      position: Vector3;
    }[] = [];
    const { width, height } = data;
    for (let y = 0; y < height; y += chunkSize) {
      for (let x = 0; x < width; x += chunkSize) {
        const geometries = stepLevels.map((step) =>
          buildChunkGeometry(data, x, y, chunkSize, step)
        );
        list.push({
          key: `${x}-${y}`,
          geometries,
          position: new Vector3(0, 0, 0)
        });
      }
    }
    return list;
  }, [data, chunkSize, stepLevels]);

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: SNOW_COLOR,
        roughness: 0.6,
        metalness: 0,
        side: DoubleSide
      }),
    []
  );

  return (
    <group>
      {chunks.map((chunk) => (
        <lod key={chunk.key} position={chunk.position}>
          <mesh geometry={chunk.geometries[0]} material={material} receiveShadow />
          <mesh geometry={chunk.geometries[1]} material={material} receiveShadow />
          <mesh geometry={chunk.geometries[2]} material={material} receiveShadow />
        </lod>
      ))}
    </group>
  );
}
