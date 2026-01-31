"use client";

import { useMemo, useState } from "react";
import { evaluateSettings, scoreAttempt } from "@proto/simulator";

const scenePresets = [
  { name: "Портрет: улица", lightEV: 9, lightKelvin: 6200, movement: 1, distance: 2, focalLength: 85 },
  { name: "Репортаж: концерт", lightEV: 5.5, lightKelvin: 4200, movement: 4, distance: 8, focalLength: 70 },
  { name: "Авто ночью", lightEV: 4, lightKelvin: 3500, movement: 2, distance: 10, focalLength: 50 },
  { name: "Архитектура закат", lightEV: 8, lightKelvin: 6800, movement: 0, distance: 30, focalLength: 24 },
  { name: "Спорт", lightEV: 6.5, lightKelvin: 4800, movement: 6, distance: 15, focalLength: 135 }
];

const tasks = [
  { title: "Правильная экспозиция", targetEV: 9, maxBlur: 0.4, maxNoise: 0.5, minDOF: 0.6 },
  { title: "Заморозить движение", targetEV: 8.5, maxBlur: 0.2, maxNoise: 0.7, minDOF: 0.5 },
  { title: "Размыть фон", targetEV: 8, maxBlur: 0.5, maxNoise: 0.6, minDOF: 0.3 }
];

export default function SimulatorPage() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [settings, setSettings] = useState({
    iso: 200,
    aperture: 2.8,
    shutter: 1 / 125,
    focalLength: scenePresets[0].focalLength,
    distance: scenePresets[0].distance,
    mode: "M" as const,
    exposureComp: 0,
    metering: "matrix" as const,
    wbKelvin: scenePresets[0].lightKelvin,
    wbTint: 0,
    sensor: "full-frame" as const,
    subjectSpeed: scenePresets[0].movement,
    cameraSpeed: 0.5,
    lightEV: scenePresets[0].lightEV
  });

  const result = useMemo(() => evaluateSettings(settings), [settings]);
  const scoring = useMemo(() => scoreAttempt(settings, tasks[0]), [settings]);

  const update = (key: string, value: number | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const scene = scenePresets[sceneIndex];

  return (
    <div className="container-base py-16 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">Практикум: симулятор камеры</h1>
          <p className="text-neutral-400">Настраивайте параметры и отслеживайте результаты в реальном времени.</p>
        </div>
        <div className="flex gap-3">
          <select
            className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm"
            value={sceneIndex}
            onChange={(event) => {
              const index = Number(event.target.value);
              const preset = scenePresets[index];
              setSceneIndex(index);
              setSettings((prev) => ({
                ...prev,
                lightEV: preset.lightEV,
                focalLength: preset.focalLength,
                distance: preset.distance,
                wbKelvin: preset.lightKelvin,
                subjectSpeed: preset.movement
              }));
            }}
          >
            {scenePresets.map((item, index) => (
              <option key={item.name} value={index}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm"
            value={settings.mode}
            onChange={(event) => update("mode", event.target.value)}
          >
            <option value="M">M</option>
            <option value="A">A(Av)</option>
            <option value="S">S(Tv)</option>
            <option value="P">P</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Сцена: {scene.name}</h2>
              <p className="text-sm text-neutral-400">EV {scene.lightEV} • {scene.lightKelvin}K • движение {scene.movement}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full ${result.exposureOffset > 1 ? "bg-red-500/20 text-red-200" : "bg-emerald-500/20 text-emerald-200"}`}>
              Экспозиция: {result.exposureOffset.toFixed(1)} EV
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 p-6 bg-white/5 space-y-4">
            <h3 className="text-sm font-semibold">Превью кадра</h3>
            <div className="h-48 rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-900 relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: `rgba(255,255,255,${result.brightness})` }} />
              <div className="absolute inset-0" style={{ backdropFilter: `blur(${result.motionBlur * 6}px)` }} />
              <div className="absolute inset-0 border border-white/10" />
              {result.exposureOffset > 1 && (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_45%,rgba(255,255,255,0.35)_50%,transparent_55%,transparent_100%)]" />
              )}
              <span className="absolute bottom-3 right-3 text-xs text-white/70">zebra</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-neutral-300">
              <span>ГРИП: {result.dof.toFixed(2)} м</span>
              <span>Шум: {(result.noise * 100).toFixed(0)}%</span>
              <span>Смаз: {(result.motionBlur * 100).toFixed(0)}%</span>
              <span>WB Δ: {(result.wbShift * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
              <h4 className="font-medium">Гистограмма</h4>
              <div className="mt-3 flex items-end gap-1 h-24">
                {result.histogram.map((value, index) => (
                  <div
                    key={index}
                    className="w-full bg-accent/70"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-2">
              <h4 className="font-medium">Подсказки</h4>
              <ul className="text-neutral-300 text-xs space-y-2">
                {result.warnings.length === 0 ? (
                  <li>Экспозиция в норме, кадр технически корректный.</li>
                ) : (
                  result.warnings.map((warning) => <li key={warning}>• {warning}</li>)
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 p-6 bg-white/5 space-y-4">
            <h3 className="text-lg font-semibold">Параметры камеры</h3>
            <label className="flex flex-col gap-2 text-sm">
              ISO
              <input type="range" min={100} max={6400} step={100} value={settings.iso} onChange={(e) => update("iso", Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Диафрагма f/{settings.aperture}
              <input type="range" min={1.4} max={16} step={0.1} value={settings.aperture} onChange={(e) => update("aperture", Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Выдержка {settings.shutter.toFixed(4)}s
              <input type="range" min={0.000125} max={0.2} step={0.000125} value={settings.shutter} onChange={(e) => update("shutter", Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Фокусное {settings.focalLength} мм
              <input type="range" min={24} max={200} step={1} value={settings.focalLength} onChange={(e) => update("focalLength", Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Дистанция {settings.distance} м
              <input type="range" min={1} max={20} step={0.5} value={settings.distance} onChange={(e) => update("distance", Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Баланс белого {settings.wbKelvin}K
              <input type="range" min={3200} max={7500} step={100} value={settings.wbKelvin} onChange={(e) => update("wbKelvin", Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Экспокоррекция {settings.exposureComp}
              <input type="range" min={-3} max={3} step={0.3} value={settings.exposureComp} onChange={(e) => update("exposureComp", Number(e.target.value))} />
            </label>
          </div>

          <div className="rounded-3xl border border-white/10 p-6 bg-white/5 space-y-3">
            <h3 className="text-lg font-semibold">Оценка задания</h3>
            <p className="text-sm text-neutral-400">Задание: {tasks[0].title}</p>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-semibold">{scoring.score}</span>
              <div className="text-xs text-neutral-300">/ 100 баллов</div>
            </div>
            <p className="text-xs text-neutral-300">{scoring.feedback}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
