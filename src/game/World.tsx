import { useEffect, useState } from "react";
import { Fog } from "three";
import { useThree } from "@react-three/fiber";
import { loadWorld, latLonToWorld } from "./data";
import Terrain from "./Terrain";
import Player from "./Player";
import Forest from "./Forest";
import Trails from "./Trails";
import Minimap from "./Minimap";
import Obstacles from "./Obstacles";
import type { GraphicsLevel } from "../App";
import type { TerrainData, PisteFeature } from "./data";
import { Physics } from "@react-three/rapier";

export type GameMode = "freeride" | "timetrial";

export default function World({
  graphics,
  onWorldStatus
}: {
  graphics: GraphicsLevel;
  onWorldStatus: (hasGenerated: boolean) => void;
}) {
  const [terrain, setTerrain] = useState<TerrainData | null>(null);
  const [features, setFeatures] = useState<PisteFeature[]>([]);
  const [mode, setMode] = useState<GameMode>("freeride");
  const { scene } = useThree();

  useEffect(() => {
    loadWorld()
      .then((result) => {
        setTerrain(result.terrain);
        setFeatures(result.features);
        onWorldStatus(result.hasGeneratedData);
      })
      .catch((error) => {
        console.error(error);
        onWorldStatus(false);
      });
  }, [onWorldStatus]);

  useEffect(() => {
    scene.fog = new Fog("#b7d4f0", 120, graphics === "low" ? 360 : 520);
  }, [scene, graphics]);

  if (!terrain) {
    return null;
  }

  const spawn = latLonToWorld(52.955, 87.949, terrain.meta);

  return (
    <Physics gravity={[0, -9.81, 0]}>
      <group>
        <Terrain data={terrain} graphics={graphics} />
        <Trails data={terrain} features={features} />
        <Forest data={terrain} graphics={graphics} />
        <Obstacles data={terrain} />
        <Player data={terrain} features={features} spawn={spawn} mode={mode} />
        <Minimap data={terrain} features={features} mode={mode} onMode={setMode} />
      </group>
    </Physics>
  );
}
