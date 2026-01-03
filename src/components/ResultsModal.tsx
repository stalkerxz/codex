import React from "react";
import { Star, X } from "lucide-react";

type ResultsModalProps = {
  score: number;
  delta: number;
  onClose: () => void;
  onNext: () => void;
};

const ResultsModal: React.FC<ResultsModalProps> = ({ score, delta, onClose, onNext }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Shot Review</p>
            <h3 className="text-xl font-semibold text-white">Capture Result</h3>
          </div>
          <button onClick={onClose} className="text-white/40 transition hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-6 flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <Star
              key={index}
              className={`h-6 w-6 ${index < score ? "text-gold" : "text-white/20"}`}
              fill={index < score ? "#EAB308" : "none"}
            />
          ))}
          <span className="ml-4 font-mono text-sm text-white/60">ΔEV {delta.toFixed(2)}</span>
        </div>
        <p className="text-sm text-white/70">
          {score >= 3
            ? "Perfect exposure. The scene sings with clarity and intent."
            : score === 2
            ? "Strong exposure. Minor adjustments could elevate the mood."
            : score === 1
            ? "Exposure drift detected. Consider balancing shutter and ISO."
            : "Exposure mismatch. Recalibrate and try again."}
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:text-white"
          >
            Review
          </button>
          <button
            onClick={onNext}
            className="rounded-full bg-gold px-5 py-2 text-xs uppercase tracking-[0.3em] text-black shadow-glow"
          >
            Next Level
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
