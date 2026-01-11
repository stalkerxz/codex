import { useMemo } from "react";
import { Color, CylinderGeometry, InstancedMesh, MeshStandardMaterial, Object3D, SphereGeometry } from "three";
import { sampleHeight } from "./terrain-utils";
import type { TerrainData } from "./data";
import type { GraphicsLevel } from "../App";

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Forest({ data, graphics }: { data: TerrainData; graphics: GraphicsLevel }) {
  const count = graphics === "high" ? 1800 : graphics === "medium" ? 1200 : 700;

  const { trunkMesh, crownMesh } = useMemo(() => {
    const trunkGeometry = new CylinderGeometry(0.4, 0.6, 6, 6);
    const crownGeometry = new SphereGeometry(2.4, 6, 6);
    const trunkMaterial = new MeshStandardMaterial({ color: new Color("#5c3b20") });
    const crownMaterial = new MeshStandardMaterial({ color: new Color("#2e5d3c") });

    const trunk = new InstancedMesh(trunkGeometry, trunkMaterial, count);
    const crown = new InstancedMesh(crownGeometry, crownMaterial, count);

    const rand = mulberry32(42);
    const temp = new Object3D();
    for (let i = 0; i < count; i += 1) {
      const x = (rand() - 0.5) * 1400;
      const z = (rand() - 0.5) * 1400;
      const y = sampleHeight(data, x, z);
      if (y < 520 || y > 1200) {
        i -= 1;
        continue;
      }
      const scale = 0.7 + rand() * 0.8;
      temp.position.set(x, y + 2, z);
      temp.scale.set(scale, scale, scale);
      temp.rotation.y = rand() * Math.PI * 2;
      temp.updateMatrix();
      trunk.setMatrixAt(i, temp.matrix);

      temp.position.set(x, y + 7 * scale, z);
      temp.scale.set(scale * 1.4, scale * 1.2, scale * 1.4);
      temp.updateMatrix();
      crown.setMatrixAt(i, temp.matrix);
    }

    trunk.instanceMatrix.needsUpdate = true;
    crown.instanceMatrix.needsUpdate = true;

    return { trunkMesh: trunk, crownMesh: crown };
  }, [data, count]);

  return (
    <group>
      <primitive object={trunkMesh} castShadow receiveShadow />
      <primitive object={crownMesh} castShadow receiveShadow />
    </group>
  );
}
