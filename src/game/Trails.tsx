import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { MeshStandardMaterial } from "three";
import type { TerrainData, PisteFeature } from "./data";
import { latLonToWorld } from "./data";

const featureColors: Record<PisteFeature["type"], string> = {
  piste: "#2f8f4e",
  lift: "#2c3e50",
  building: "#8e6e53",
  road: "#555"
};

export default function Trails({
  data,
  features
}: {
  data: TerrainData;
  features: PisteFeature[];
}) {
  const lines = useMemo(
    () =>
      features.map((feature) => {
        const points = feature.coordinates.map(([lat, lon]) => {
          const { x, z } = latLonToWorld(lat, lon, data.meta);
          return [x, 2, z] as [number, number, number];
        });
        return { feature, points };
      }),
    [features, data]
  );

  const stationMaterial = useMemo(
    () => new MeshStandardMaterial({ color: "#8c8a7a" }),
    []
  );

  return (
    <group>
      {lines.map(({ feature, points }) => (
        <Line
          key={feature.id}
          points={points}
          color={featureColors[feature.type] ?? "white"}
          lineWidth={feature.type === "lift" ? 1.8 : 2.5}
          dashed={feature.type === "lift"}
          dashScale={1}
          dashSize={4}
          gapSize={2}
        />
      ))}
      {lines
        .filter((line) => line.feature.type === "lift")
        .map(({ feature, points }) => (
          <group key={`${feature.id}-stations`}>
            {[points[0], points[points.length - 1]].map((point, index) => (
              <mesh
                key={`${feature.id}-station-${index}`}
                position={[point[0], point[1] + 1, point[2]]}
                material={stationMaterial}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[4, 4, 4]} />
              </mesh>
            ))}
          </group>
        ))}
    </group>
  );
}
