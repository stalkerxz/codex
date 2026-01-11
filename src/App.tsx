import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Stats, OrbitControls } from "@react-three/drei";
import { EffectComposer, SMAA, SSAO } from "@react-three/postprocessing";
import World from "./game/World";
import HUD from "./game/HUD";
import { GameStateProvider } from "./game/state";
import "./app.css";

export type GraphicsLevel = "low" | "medium" | "high";

const defaultGraphics: GraphicsLevel = "medium";

export default function App() {
  const [graphics, setGraphics] = useState<GraphicsLevel>(defaultGraphics);
  const [showSsao, setShowSsao] = useState(false);
  const [hasGeneratedData, setHasGeneratedData] = useState(true);

  return (
    <GameStateProvider>
      <div className="app">
        <Canvas
          shadows
          camera={{ position: [0, 35, 65], fov: 55, near: 0.1, far: 4000 }}
        >
          <color attach="background" args={["#b7d4f0"]} />
          <ambientLight intensity={0.35} />
          <directionalLight
            castShadow
            position={[120, 140, 80]}
            intensity={1.2}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={10}
            shadow-camera-far={400}
            shadow-camera-left={-140}
            shadow-camera-right={140}
            shadow-camera-top={140}
            shadow-camera-bottom={-140}
          />
          <Suspense fallback={null}>
            <Environment preset="sunset" />
            <World graphics={graphics} onWorldStatus={setHasGeneratedData} />
          </Suspense>
          <EffectComposer>
            {showSsao && (
              <SSAO
                samples={8}
                radius={12}
                intensity={18}
                luminanceInfluence={0.4}
                color="black"
              />
            )}
            <SMAA />
          </EffectComposer>
          <OrbitControls
            enablePan={false}
            enableRotate={false}
            enableZoom={false}
          />
        </Canvas>
        <HUD
          graphics={graphics}
          onGraphicsChange={setGraphics}
          showSsao={showSsao}
          onToggleSsao={() => setShowSsao((value) => !value)}
          hasGeneratedData={hasGeneratedData}
        />
        <Stats className="stats" />
      </div>
    </GameStateProvider>
  );
}
