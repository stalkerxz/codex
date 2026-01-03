import React, { useMemo, useState } from "react";
import { useGame } from "../state/gameContext";
import { clamp } from "../services/gameEngine";
import { Focus, Aperture } from "lucide-react";

const histogramBars = [30, 40, 55, 75, 60, 45, 30, 20, 10];

const Viewfinder: React.FC = () => {
  const { settings, delta, ev, currentLevel, imageUrl, isLoading } = useGame();
  const [focusPulse, setFocusPulse] = useState(false);

  const exposureBrightness = useMemo(
    () => clamp(1 + delta * 0.2, 0.6, 1.5),
    [delta]
  );
  const bokehBlur = useMemo(
    () => clamp((2.8 / settings.aperture) * 1.6, 0, 6),
    [settings.aperture]
  );
  const motionBlur = useMemo(
    () => clamp(settings.shutterSpeed * 120 - 0.4, 0, 6),
    [settings.shutterSpeed]
  );
  const noiseOpacity = useMemo(
    () => clamp((settings.iso - 200) / 6400, 0, 0.6),
    [settings.iso]
  );

  const handleFocus = () => {
    setFocusPulse(true);
    setTimeout(() => setFocusPulse(false), 800);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 text-xs uppercase tracking-[0.35em] text-white/60">
        <span>EVF // {currentLevel.title}</span>
        <span className="font-mono text-cyan">EV {ev.toFixed(1)}</span>
      </div>
      <div
        className="relative aspect-[16/9] w-full overflow-hidden"
        onClick={handleFocus}
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.15),_transparent_55%)]"
          style={{ filter: `brightness(${exposureBrightness})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: imageUrl
              ? `url(${imageUrl})`
              : "linear-gradient(120deg, rgba(34,211,238,0.15), rgba(236,72,153,0.2), rgba(234,179,8,0.1))",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: `brightness(${exposureBrightness}) blur(${bokehBlur}px)`,
          }}
        />
        <div
          className="absolute inset-0 mix-blend-screen"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03))",
            filter: `brightness(${exposureBrightness}) blur(${motionBlur}px)`,
          }}
        />
        <div
          className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="120" height="120" filter="url(%23n)" opacity="0.4"/></svg>')] opacity-0 mix-blend-soft-light"
          style={{ opacity: noiseOpacity }}
        />
        {delta > 0.8 && (
          <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_10px,transparent_10px,transparent_20px)] opacity-30" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`h-24 w-24 rounded-xl border border-white/60 transition-all duration-500 ${
              focusPulse ? "scale-110 shadow-[0_0_30px_rgba(234,179,8,0.6)]" : ""
            }`}
          >
            <div className="flex h-full w-full items-center justify-center text-gold/80">
              <Focus className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-end justify-between px-6 py-4">
          <div className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/70">
            Target EV {currentLevel.targetEV}
          </div>
          <div className="flex items-end gap-1">
            {histogramBars.map((bar, index) => (
              <div
                key={index}
                className="w-2 rounded-sm bg-gradient-to-t from-cyan/70 via-magenta/70 to-gold/70"
                style={{ height: `${bar}%` }}
              />
            ))}
          </div>
        </div>
        <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/70">
          <Aperture className="h-4 w-4 text-gold" />
          <span>Focus Hunting</span>
        </div>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm uppercase tracking-[0.4em] text-gold">
            Generating Scene...
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewfinder;
