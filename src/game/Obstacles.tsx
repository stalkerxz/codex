import { useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial, Vector3 } from "three";
import { RigidBody } from "@react-three/rapier";
import { sampleHeight } from "./terrain-utils";
import type { TerrainData } from "./data";

export default function Obstacles({ data }: { data: TerrainData }) {
  const obstacles = useMemo(() => {
    const list: Vector3[] = [];
    for (let i = 0; i < 16; i += 1) {
      const x = (Math.random() - 0.5) * 900;
      const z = (Math.random() - 0.5) * 900;
      const y = sampleHeight(data, x, z);
      list.push(new Vector3(x, y + 1.2, z));
    }
    return list;
  }, [data]);

  const geometry = useMemo(() => new BoxGeometry(2.4, 2.4, 2.4), []);
  const material = useMemo(() => new MeshStandardMaterial({ color: "#3b3f46" }), []);

  return (
    <group>
      {obstacles.map((pos, index) => (
        <RigidBody key={index} type="fixed" colliders="cuboid">
          <mesh geometry={geometry} material={material} position={[pos.x, pos.y, pos.z]} castShadow />
        </RigidBody>
      ))}
    </group>
  );
}
