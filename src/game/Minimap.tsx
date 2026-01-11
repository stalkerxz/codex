import { useMemo } from "react";
import { Html, Line } from "@react-three/drei";
import { MeshBasicMaterial } from "three";
import { useGameState } from "./state";
import type { TerrainData, PisteFeature } from "./data";
import { latLonToWorld } from "./data";
import type { GameMode } from "./World";
import "./minimap.css";

export default function Minimap({
  data,
  features,
  mode,
  onMode
}: {
  data: TerrainData;
  features: PisteFeature[];
  mode: GameMode;
  onMode: (mode: GameMode) => void;
}) {
  const { telemetry } = useGameState();

  const lines = useMemo(() =>
    features.map((feature) => {
      const points = feature.coordinates.map(([lat, lon]) => {
        const { x, z } = latLonToWorld(lat, lon, data.meta);
        return [x, 0, z] as [number, number, number];
      });
      return { feature, points };
    }), [features, data]
  );

  const size = 130;
  const scale = 0.07;
  const borderMaterial = new MeshBasicMaterial({ color: "#ffffff" });

  return (
    <group position={[0, 0, 0]}>
      <group position={[0, 0, 0]}>
        <mesh position={[0, 60, -80]} scale={[scale, scale, scale]}>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial color="#0b1a2b" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 60, -80]} scale={[scale, scale, scale]}>
          <planeGeometry args={[size + 4, size + 4]} />
          <primitive object={borderMaterial} />
        </mesh>
        {lines.map(({ feature, points }) => (
          <Line
            key={feature.id}
            points={points}
            position={[0, 60, -80]}
            scale={[scale, scale, scale]}
            color={feature.type === "lift" ? "#ffb347" : "#7ed957"}
            lineWidth={2}
          />
        ))}
      </group>
      <Html position={[-1.2, 63, -80]} transform>
        <HtmlOverlay telemetry={telemetry} mode={mode} onMode={onMode} />
      </Html>
    </group>
  );
}

function HtmlOverlay({
  telemetry,
  mode,
  onMode
}: {
  telemetry: ReturnType<typeof useGameState>["telemetry"];
  mode: GameMode;
  onMode: (mode: GameMode) => void;
}) {
  return (
    <div className="minimap">
      <div className="minimap__row">
        <span>Mode:</span>
        <button type="button" onClick={() => onMode(mode === "freeride" ? "timetrial" : "freeride")}>
          {mode === "freeride" ? "Free Ride" : "Time Trial"}
        </button>
      </div>
      <div className="minimap__row">
        <span>Высота:</span>
        <strong>{telemetry.altitude.toFixed(0)} м</strong>
      </div>
    </div>
  );
}
