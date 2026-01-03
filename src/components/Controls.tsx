import React from "react";
import { useGame } from "../state/gameContext";
import { Aperture, Gauge, Timer, Zap } from "lucide-react";

const isoOptions = [100, 200, 400, 800, 1600, 3200, 6400, 12800];
const apertureOptions = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
const shutterOptions = [1 / 4000, 1 / 2000, 1 / 1000, 1 / 500, 1 / 250, 1 / 125, 1 / 60, 1 / 30, 1 / 15, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8, 15, 30];

const formatShutter = (value: number) => (value >= 1 ? `${value}s` : `1/${Math.round(1 / value)}`);

const Controls: React.FC = () => {
  const { settings, setISO, setAperture, setShutter, shoot } = useGame();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Control Deck</p>
          <h2 className="text-lg font-semibold text-white">Precision Dials</h2>
        </div>
        <button
          onClick={shoot}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-red-400/60 bg-red-600/80 shadow-[0_0_15px_rgba(239,68,68,0.6)] transition hover:scale-105"
        >
          <Zap className="h-6 w-6 text-white" />
        </button>
      </div>
      <div className="grid gap-6">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/70">
              <Gauge className="h-4 w-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.3em]">ISO</span>
            </div>
            <span className="font-mono text-lg text-cyan">{settings.iso}</span>
          </div>
          <input
            type="range"
            min={0}
            max={isoOptions.length - 1}
            step={1}
            value={isoOptions.indexOf(settings.iso)}
            onChange={(event) => setISO(isoOptions[Number(event.target.value)])}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-gold"
          />
          <div className="mt-2 flex justify-between text-[10px] text-white/30">
            {isoOptions.map((iso) => (
              <span key={iso}>{iso}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/70">
              <Aperture className="h-4 w-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.3em]">Aperture</span>
            </div>
            <span className="font-mono text-lg text-magenta">f/{settings.aperture}</span>
          </div>
          <input
            type="range"
            min={0}
            max={apertureOptions.length - 1}
            step={1}
            value={apertureOptions.indexOf(settings.aperture)}
            onChange={(event) => setAperture(apertureOptions[Number(event.target.value)])}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-gold"
          />
          <div className="mt-2 flex justify-between text-[10px] text-white/30">
            {apertureOptions.map((aperture) => (
              <span key={aperture}>f/{aperture}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/70">
              <Timer className="h-4 w-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.3em]">Shutter</span>
            </div>
            <span className="font-mono text-lg text-cyan">{formatShutter(settings.shutterSpeed)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={shutterOptions.length - 1}
            step={1}
            value={shutterOptions.indexOf(settings.shutterSpeed)}
            onChange={(event) => setShutter(shutterOptions[Number(event.target.value)])}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-gold"
          />
          <div className="mt-2 flex justify-between text-[10px] text-white/30">
            {shutterOptions.slice(0, 8).map((speed) => (
              <span key={speed}>{formatShutter(speed)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
