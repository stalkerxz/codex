import React, { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { analyzePhoto } from "../services/genAIService";

const pillars = ["Subject", "Light", "Composition", "Moment", "Technique"];

type AnalysisModalProps = {
  open: boolean;
  onClose: () => void;
};

const AnalysisModal: React.FC<AnalysisModalProps> = ({ open, onClose }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setLoading(true);
      const result = await analyzePhoto(base64);
      setAnalysis(JSON.stringify(result, null, 2));
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">AI Review</p>
            <h3 className="text-xl font-semibold text-white">Photo Critique</h3>
          </div>
          <button onClick={onClose} className="text-white/40 transition hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/20 bg-black/40 px-6 py-6 text-sm text-white/70">
          <UploadCloud className="h-6 w-6 text-gold" />
          <span>Upload a real photo for analysis</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
        {loading && <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">Analyzing...</p>}
        {analysis && (
          <div className="mt-6 space-y-3 text-sm text-white/70">
            {pillars.map((pillar) => (
              <div key={pillar} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <h4 className="mb-2 text-xs uppercase tracking-[0.3em] text-gold">{pillar}</h4>
                <pre className="whitespace-pre-wrap font-mono text-xs">{analysis}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisModal;
