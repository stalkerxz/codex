import React, { useState } from "react";
import { GameProvider, useGame } from "./state/gameContext";
import Viewfinder from "./components/Viewfinder";
import Controls from "./components/Controls";
import ResultsModal from "./components/ResultsModal";
import TheorySheet from "./components/TheorySheet";
import AnalysisModal from "./components/AnalysisModal";
import { Camera, Sparkles, Wand2, BookOpen, Upload } from "lucide-react";

const ExposureMeter: React.FC = () => {
  const { delta } = useGame();
  const position = Math.max(-2, Math.min(2, delta));
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.3em] text-white/50">
      <span>Exposure</span>
      <div className="relative h-2 w-full rounded-full bg-white/10">
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-gold shadow-glow"
          style={{ left: `${50 + position * 20}%` }}
        />
      </div>
      <div className="flex justify-between font-mono text-[10px] text-white/40">
        <span>-2</span>
        <span>0</span>
        <span>+2</span>
      </div>
    </div>
  );
};

const Shell: React.FC = () => {
  const { currentLevel, prompt, remixScene, applyMagicEdit, score, delta, nextLevel, shoot, clearScore } = useGame();
  const [isTheoryOpen, setTheoryOpen] = useState(false);
  const [isAnalysisOpen, setAnalysisOpen] = useState(false);
  const [magicEditText, setMagicEditText] = useState("");

  const handleMagicEdit = async () => {
    if (!magicEditText.trim()) return;
    await applyMagicEdit(magicEditText.trim());
    setMagicEditText("");
  };

  return (
    <div className="min-h-screen bg-obsidian text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/40">
              <Camera className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">PhotoQuest Pro</p>
              <h1 className="text-2xl font-semibold">{currentLevel.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheoryOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:text-white"
            >
              <BookOpen className="h-4 w-4 text-gold" />
              Theory
            </button>
            <button
              onClick={() => setAnalysisOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:text-white"
            >
              <Upload className="h-4 w-4 text-gold" />
              AI Review
            </button>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Viewfinder />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Mission Brief</p>
                <p className="mt-2 text-lg text-white">{currentLevel.hint}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/40">Prompt</p>
                <p className="mt-2 font-mono text-xs text-cyan">{prompt}</p>
              </div>
              <ExposureMeter />
            </div>
          </div>
          <div className="space-y-6">
            <Controls />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">AI Scene Lab</p>
                  <h3 className="text-lg font-semibold">Remix & Magic Edit</h3>
                </div>
                <button
                  onClick={remixScene}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:text-white"
                >
                  <Sparkles className="h-4 w-4 text-gold" />
                  Remix
                </button>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={magicEditText}
                  onChange={(event) => setMagicEditText(event.target.value)}
                  placeholder="Make it cyberpunk neon..."
                  className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 outline-none placeholder:text-white/30"
                />
                <button
                  onClick={handleMagicEdit}
                  className="rounded-2xl bg-gold px-4 text-xs uppercase tracking-[0.3em] text-black"
                >
                  <Wand2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">Ready</p>
                  <p className="text-sm text-white/70">Capture when exposure is aligned.</p>
                </div>
                <button
                  onClick={shoot}
                  className="rounded-full border border-gold/40 bg-gold/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-gold"
                >
                  Trigger
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <TheorySheet open={isTheoryOpen} onClose={() => setTheoryOpen(false)} />
      <AnalysisModal open={isAnalysisOpen} onClose={() => setAnalysisOpen(false)} />
      {score !== null && (
        <ResultsModal score={score} delta={delta} onClose={clearScore} onNext={nextLevel} />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <GameProvider>
    <Shell />
  </GameProvider>
);

export default App;
