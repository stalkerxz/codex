import { useEffect, useState } from "react";

export type ControlState = {
  forward: number;
  turn: number;
  brake: boolean;
  jump: boolean;
  mode: "snowboard" | "ski";
};

const defaultState: ControlState = {
  forward: 0,
  turn: 0,
  brake: false,
  jump: false,
  mode: "snowboard"
};

export function useControls() {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    const pressed = new Set<string>();

    const update = () => {
      const forward = pressed.has("KeyW") ? 1 : pressed.has("KeyS") ? -1 : 0;
      const turn = pressed.has("KeyA") ? 1 : pressed.has("KeyD") ? -1 : 0;
      const brake = pressed.has("ShiftLeft") || pressed.has("ShiftRight");
      const jump = pressed.has("Space");
      setState((prev) => ({
        ...prev,
        forward,
        turn,
        brake,
        jump
      }));
    };

    const handleDown = (event: KeyboardEvent) => {
      pressed.add(event.code);
      if (event.code === "KeyM") {
        setState((prev) => ({
          ...prev,
          mode: prev.mode === "snowboard" ? "ski" : "snowboard"
        }));
      }
      update();
    };

    const handleUp = (event: KeyboardEvent) => {
      pressed.delete(event.code);
      update();
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  return state;
}
