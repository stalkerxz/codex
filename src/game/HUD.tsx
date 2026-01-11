import { useMemo } from "react";
import { useGameState } from "./state";
import type { GraphicsLevel } from "../App";
import "./hud.css";

export default function HUD({
  graphics,
  onGraphicsChange,
  showSsao,
  onToggleSsao,
  hasGeneratedData
}: {
  graphics: GraphicsLevel;
  onGraphicsChange: (level: GraphicsLevel) => void;
  showSsao: boolean;
  onToggleSsao: () => void;
  hasGeneratedData: boolean;
}) {
  const { telemetry } = useGameState();

  const speed = useMemo(() => telemetry.speed.toFixed(1), [telemetry.speed]);
  const slope = useMemo(() => telemetry.slope.toFixed(1), [telemetry.slope]);

  return (
    <div className="hud">
      <div className="hud__panel">
        <h1>Sheregesh Ride MVP</h1>
        <div className="hud__row">
          <span>Скорость</span>
          <strong>{speed} км/ч</strong>
        </div>
        <div className="hud__row">
          <span>Угол склона</span>
          <strong>{slope}°</strong>
        </div>
        <div className="hud__row">
          <span>Высота</span>
          <strong>{telemetry.altitude.toFixed(0)} м</strong>
        </div>
        <div className="hud__row">
          <span>Режим</span>
          <strong>{telemetry.mode === "snowboard" ? "Сноуборд" : "Лыжи"}</strong>
        </div>
        <div className="hud__row">
          <span>Дистанция</span>
          <strong>{telemetry.distance.toFixed(0)} м</strong>
        </div>
        <div className="hud__row">
          <span>Перепад</span>
          <strong>{telemetry.verticalDrop.toFixed(0)} м</strong>
        </div>
        <div className="hud__row">
          <span>Time Trial</span>
          <strong>
            {telemetry.timeTrialActive
              ? `${telemetry.timeTrialSeconds.toFixed(1)} c`
              : telemetry.timeTrialComplete
              ? `Финиш: ${telemetry.timeTrialSeconds.toFixed(1)} c`
              : "Ожидание"}
          </strong>
        </div>
        <div className="hud__divider" />
        {!hasGeneratedData && (
          <div className="hud__warning">
            <strong>Данных мира нет.</strong>
            <span>Сгенерируйте мир: <code>npm run prepare-world</code></span>
          </div>
        )}
        <div className="hud__row">
          <span>Графика</span>
          <select
            value={graphics}
            onChange={(event) => onGraphicsChange(event.target.value as GraphicsLevel)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="hud__row">
          <span>SSAO</span>
          <button type="button" onClick={onToggleSsao}>
            {showSsao ? "On" : "Off"}
          </button>
        </div>
        <div className="hud__row hud__hint">
          <span>Управление:</span>
          <span>W/S — вес, A/D — канты, Shift — тормоз, Space — прыжок, M — режим</span>
        </div>
      </div>
    </div>
  );
}
