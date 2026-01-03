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
    if (exposure < -0.3) return "Недоэкспонировано";
    if (exposure > 0.3) return "Переэкспонировано";
    return "Нормально";
  }, [exposure]);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Практика</h1>
        <p>Визуальные инструменты, чтобы отработать композицию и экспозицию без камеры.</p>
      </div>
      <div className="practice-grid">
        <div className="practice-card">
          <h2>Виртуальный видоискатель</h2>
          <p>Выберите соотношение сторон, включите сетку третей и продумайте кадр заранее.</p>
          <div className="viewfinder-controls">
            <div className="segmented-control" role="group" aria-label="Выбор соотношения сторон">
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
              <span>Сетка третей</span>
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
          <h2>Симулятор светомера</h2>
          <p>Перемещайте ползунок, чтобы увидеть, как экспозиция влияет на настроение и детали.</p>
          <div className="light-meter">
            <div
              className="light-meter-preview"
              style={{
                filter: `brightness(${1 + exposure}) contrast(${1 + exposure * 0.4})`
              }}
            >
              <div className="light-meter-text">Превью сцены</div>
            </div>
            <div className="light-meter-controls">
              <input
                type="range"
                min={-1}
                max={1}
                step={0.05}
                value={exposure}
                onChange={(event) => setExposure(Number(event.target.value))}
                aria-label="Ползунок экспозиции"
              />
              <div className="light-meter-labels">
                <span>Недоэкспонировано</span>
                <strong>{exposureLabel}</strong>
                <span>Переэкспонировано</span>
              </div>
              <p className="muted-text">
                Ползунок показывает, как экспозиция меняет фактуру: тёмные тона прячут детали, сбалансированные выглядят
                естественно, а светлые сглаживают контраст.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PracticeLabPage;
