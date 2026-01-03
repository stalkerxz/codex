import { useEffect, useMemo, useState } from "react";
import { lessons } from "../data/lessons";
import { UserProgress } from "../data/types";
import { listAchievements } from "../db/indexedDb";

const GalleryPage = () => {
  const [achievements, setAchievements] = useState<UserProgress[]>([]);
  const [selected, setSelected] = useState<UserProgress | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await listAchievements();
      setAchievements(data);
    };
    load();
  }, []);

  const achievementsWithMeta = useMemo(() => {
    return achievements.map((item) => {
      const lesson = lessons.find((entry) => entry.id === item.lessonId);
      const url = item.uploadedImage ? URL.createObjectURL(item.uploadedImage) : null;
      return { ...item, lesson, url };
    });
  }, [achievements]);

  const selectedUrl = useMemo(() => {
    if (!selected?.uploadedImage) return null;
    return URL.createObjectURL(selected.uploadedImage);
  }, [selected]);

  useEffect(() => {
    return () => {
      achievementsWithMeta.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, [achievementsWithMeta]);

  useEffect(() => {
    return () => {
      if (selectedUrl) URL.revokeObjectURL(selectedUrl);
    };
  }, [selectedUrl]);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Gallery of Achievements</h1>
        <p>Completed missions appear here with your uploaded images and the date you mastered them.</p>
      </div>
      {achievementsWithMeta.length === 0 ? (
        <p className="muted-text">Complete a mission to see it appear in the gallery.</p>
      ) : (
        <div className="gallery-grid">
          {achievementsWithMeta.map((item) => (
            <button
              key={item.lessonId}
              type="button"
              className="gallery-card"
              onClick={() => setSelected(item)}
            >
              {item.url ? <img src={item.url} alt={item.lesson?.title ?? "Gallery item"} /> : <div />}
              <div className="gallery-card-content">
                <h3>{item.lesson?.title}</h3>
                {item.completedAt && (
                  <p className="muted-text">Completed {new Date(item.completedAt).toLocaleDateString()}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content">
            <button type="button" className="modal-close" onClick={() => setSelected(null)}>
              Close
            </button>
            <h2>{lessons.find((lesson) => lesson.id === selected.lessonId)?.title}</h2>
            {selectedUrl && <img src={selectedUrl} alt="Selected achievement" className="modal-image" />}
            <div className="modal-checklist">
              <h3>Checklist Summary</h3>
              <ul>
                {lessons
                  .find((lesson) => lesson.id === selected.lessonId)
                  ?.checklistItems.map((item, index) => (
                    <li key={item}>
                      {selected.checklistCheckedStates[index] ? "✓" : "•"} {item}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GalleryPage;
