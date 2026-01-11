import { createContext, useContext, useMemo, useState } from "react";

export type Telemetry = {
  speed: number;
  slope: number;
  altitude: number;
  mode: "snowboard" | "ski";
  distance: number;
  verticalDrop: number;
  timeTrialSeconds: number;
  timeTrialActive: boolean;
  timeTrialComplete: boolean;
};

const defaultTelemetry: Telemetry = {
  speed: 0,
  slope: 0,
  altitude: 0,
  mode: "snowboard",
  distance: 0,
  verticalDrop: 0,
  timeTrialSeconds: 0,
  timeTrialActive: false,
  timeTrialComplete: false
};

const GameStateContext = createContext<{
  telemetry: Telemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<Telemetry>>;
}>({
  telemetry: defaultTelemetry,
  setTelemetry: () => {}
});

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [telemetry, setTelemetry] = useState(defaultTelemetry);
  const value = useMemo(() => ({ telemetry, setTelemetry }), [telemetry]);
  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

export function useGameState() {
  return useContext(GameStateContext);
}
