import { useEffect, useMemo, useRef } from "react";
import { Group, MeshStandardMaterial, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "./controls";
import { sampleHeight, sampleNormal } from "./terrain-utils";
import { latLonToWorld } from "./data";
import { useGameState } from "./state";
import type { TerrainData, PisteFeature } from "./data";

export default function Player({
  data,
  spawn,
  mode,
  features
}: {
  data: TerrainData;
  features: PisteFeature[];
  spawn: { x: number; z: number };
  mode: "freeride" | "timetrial";
}) {
  const controls = useControls();
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);
  const velocity = useRef(new Vector3(0, 0, 0));
  const position = useRef(new Vector3(spawn.x, data.meta.maxElevation + 8, spawn.z));
  const prevPosition = useRef(position.current.clone());
  const { telemetry, setTelemetry } = useGameState();

  const timeTrialPath = useMemo(() => {
    const piste = features.find((feature) => feature.type === "piste");
    if (!piste) return null;
    return piste.coordinates.map(([lat, lon]) => {
      const { x, z } = latLonToWorld(lat, lon, data.meta);
      return new Vector3(x, sampleHeight(data, x, z) + 1.4, z);
    });
  }, [features, data]);

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: controls.mode === "snowboard" ? "#353b48" : "#dcdde1",
        roughness: 0.4
      }),
    [controls.mode]
  );

  useEffect(() => {
    position.current.set(spawn.x, data.meta.maxElevation + 8, spawn.z);
    velocity.current.set(0, 0, 0);
  }, [spawn, data.meta.maxElevation]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.033);
    const pos = position.current;
    const vel = velocity.current;
    const groundHeight = sampleHeight(data, pos.x, pos.z) + 1.4;
    const normal = sampleNormal(data, pos.x, pos.z);

    const slopeAngle = Math.acos(Math.min(1, Math.max(-1, normal.y)));
    const slopeDir = new Vector3(normal.x, normal.y, normal.z)
      .cross(new Vector3(0, 1, 0))
      .cross(new Vector3(normal.x, normal.y, normal.z))
      .normalize();

    const gravity = new Vector3(0, -9.81, 0);
    const tangentGravity = gravity.clone().projectOnPlane(new Vector3(normal.x, normal.y, normal.z));

    const turnStrength = controls.mode === "ski" ? 1.2 : 1.0;
    const edgeFactor = Math.abs(controls.turn) * 0.8 + (controls.brake ? 0.6 : 0.1);
    const forwardFactor = controls.forward * 4;

    const forward = new Vector3(0, 0, -1).applyAxisAngle(new Vector3(0, 1, 0),
      controls.turn * turnStrength * dt
    );

    const acceleration = tangentGravity
      .add(slopeDir.multiplyScalar(forwardFactor))
      .add(forward.multiplyScalar(controls.turn * 1.5));

    vel.add(acceleration.multiplyScalar(dt));

    const lateral = new Vector3(vel.x, 0, vel.z).normalize();
    const speed = vel.length();
    const friction = (controls.brake ? 0.8 : 0.2) + edgeFactor * 0.6;
    vel.multiplyScalar(1 - friction * dt);

    if (controls.jump && pos.y - groundHeight < 1.8) {
      vel.y = 6;
    }

    pos.addScaledVector(vel, dt);

    if (pos.y <= groundHeight) {
      pos.y = groundHeight;
      vel.y = Math.max(vel.y, 0);
      if (speed < 0.2) {
        vel.multiplyScalar(0.98);
      }
    }

    if (groupRef.current) {
      groupRef.current.position.copy(pos);
      const lookAt = pos.clone().add(lateral.lengthSq() > 0.01 ? lateral : slopeDir);
      groupRef.current.lookAt(lookAt.x, pos.y, lookAt.z);
    }

    const heading = lateral.lengthSq() > 0.01 ? lateral.clone() : slopeDir.clone();
    const camOffset = heading.clone().multiplyScalar(-18);
    camOffset.y = 8;
    const desiredCamera = pos.clone().add(camOffset);
    camera.position.lerp(desiredCamera, 0.08);
    camera.lookAt(pos.x, pos.y + 2, pos.z);

    const dist = pos.distanceTo(prevPosition.current);
    const prevY = prevPosition.current.y;

    setTelemetry((prev) => {
      let timeTrialActive = prev.timeTrialActive;
      let timeTrialComplete = prev.timeTrialComplete;
      let timeTrialSeconds = prev.timeTrialSeconds;

      if (mode === "timetrial" && timeTrialPath && timeTrialPath.length > 1) {
        const start = timeTrialPath[0];
        const end = timeTrialPath[timeTrialPath.length - 1];
        if (!timeTrialActive && !timeTrialComplete && pos.distanceTo(start) < 12) {
          timeTrialActive = true;
          timeTrialSeconds = 0;
        }
        if (timeTrialActive && !timeTrialComplete) {
          timeTrialSeconds += dt;
          if (pos.distanceTo(end) < 12) {
            timeTrialComplete = true;
            timeTrialActive = false;
          }
        }
      } else if (mode === "freeride") {
        timeTrialActive = false;
        timeTrialComplete = false;
        timeTrialSeconds = 0;
      }

      return {
        speed: speed * 3.6,
        slope: (slopeAngle * 180) / Math.PI,
        altitude: pos.y,
        mode: controls.mode,
        distance: prev.distance + dist,
        verticalDrop: prev.verticalDrop + Math.max(0, prevY - pos.y),
        timeTrialSeconds,
        timeTrialActive,
        timeTrialComplete
      };
    });

    prevPosition.current.copy(pos);
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <capsuleGeometry args={[0.6, 1.4, 6, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0, -0.7, 0]} castShadow>
        <boxGeometry args={[controls.mode === "ski" ? 1.2 : 1.6, 0.15, 3]} />
        <meshStandardMaterial color={controls.mode === "ski" ? "#c23616" : "#273c75"} />
      </mesh>
    </group>
  );
}
