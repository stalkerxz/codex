import React from "react";
import { BookOpen, X } from "lucide-react";

const tips = [
  {
    title: "Exposure Triangle",
    body: "ISO controls sensor sensitivity, aperture shapes depth of field, shutter speed freezes or drags motion. Balance all three to match the scene EV.",
  },
  {
    title: "Subject Priority",
    body: "When the story is motion, lock shutter first. For mood and separation, lock aperture first. ISO is your safety net.",
  },
  {
    title: "Histogram Reading",
    body: "A balanced histogram avoids clipped shadows or highlights. Use zebras to protect specular highlights.",
  },
];

type TheorySheetProps = {
  open: boolean;
  onClose: () => void;
};

const TheorySheet: React.FC<TheorySheetProps> = ({ open, onClose }) => {
  return (
    <div
      className={`fixed right-0 top-0 z-40 h-full w-full max-w-md transform border-l border-white/10 bg-black/70 backdrop-blur-xl transition-transform duration-500 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gold" />
          <h3 className="text-lg font-semibold">Theory Guide</h3>
        </div>
        <button onClick={onClose} className="text-white/40 transition hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-6 px-6 py-6 text-sm text-white/70">
        {tips.map((tip) => (
          <div key={tip.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h4 className="mb-2 text-xs uppercase tracking-[0.3em] text-gold">{tip.title}</h4>
            <p>{tip.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TheorySheet;
