import { useMemo, useState } from "react";

const aspectRatios = [
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "16:9", value: 16 / 9 }
];

const PracticeLabPage = () => {
  const [ratio, setRatio] = useState(aspectRatios[0]);
  const [showGrid, setShowGrid] = useState(true);
  const [exposure, setExposure] = useState(0);

  const exposureLabel = useMemo(() => {
    if (exposure < -0.3) return "Underexposed";
    if (exposure > 0.3) return "Overexposed";
    return "Proper";
  }, [exposure]);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Practice Lab</h1>
        <p>Visual tools to rehearse composition and exposure without a camera.</p>
      </div>
      <div className="practice-grid">
        <div className="practice-card">
          <h2>Virtual Viewfinder</h2>
          <p>Choose an aspect ratio, enable the rule-of-thirds grid, and plan your framing.</p>
          <div className="viewfinder-controls">
            <div className="segmented-control" role="group" aria-label="Aspect ratio selection">
              {aspectRatios.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={ratio.label === option.label ? "active" : ""}
                  onClick={() => setRatio(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="toggle">
              <input type="checkbox" checked={showGrid} onChange={() => setShowGrid((prev) => !prev)} />
              <span>Rule-of-thirds grid</span>
            </label>
          </div>
          <div className="viewfinder" style={{ aspectRatio: ratio.value }}>
            <div className="safe-frame" />
            {showGrid && (
              <div className="grid-overlay" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
        </div>

        <div className="practice-card">
          <h2>Light Meter Simulator</h2>
          <p>Slide through exposure levels to see how brightness and contrast shape mood.</p>
          <div className="light-meter">
            <div
              className="light-meter-preview"
              style={{
                filter: `brightness(${1 + exposure}) contrast(${1 + exposure * 0.4})`
              }}
            >
              <div className="light-meter-text">Scene preview</div>
            </div>
            <div className="light-meter-controls">
              <input
                type="range"
                min={-1}
                max={1}
                step={0.05}
                value={exposure}
                onChange={(event) => setExposure(Number(event.target.value))}
                aria-label="Exposure slider"
              />
              <div className="light-meter-labels">
                <span>Underexposed</span>
                <strong>{exposureLabel}</strong>
                <span>Overexposed</span>
              </div>
              <p className="muted-text">
                The slider shows how exposure changes texture visibility: darker tones hide detail, balanced tones feel
                natural, and bright tones flatten contrast.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PracticeLabPage;
