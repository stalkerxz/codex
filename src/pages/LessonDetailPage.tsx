import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { lessons } from "../data/lessons";
import { Lesson, UserProgress } from "../data/types";
import { getProgress, saveProgress } from "../db/indexedDb";
import StatusBadge, { StatusKey } from "../components/StatusBadge";
import PlaceholderImage from "../components/PlaceholderImage";

const MAX_FILE_SIZE = 12 * 1024 * 1024;

const createEmptyProgress = (lesson: Lesson): UserProgress => ({
  lessonId: lesson.id,
  checklistCheckedStates: lesson.checklistItems.map(() => false),
  mastered: false
});

const LessonDetailPage = () => {
  const { lessonId } = useParams();
  const lesson = lessons.find((item) => item.id === lessonId);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lesson) return;
    const load = async () => {
      const stored = await getProgress(lesson.id);
      setProgress(stored ?? createEmptyProgress(lesson));
    };
    load();
  }, [lesson]);

  const previewUrl = useMemo(() => {
    if (!progress?.uploadedImage) return null;
    return URL.createObjectURL(progress.uploadedImage);
  }, [progress?.uploadedImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!lesson) {
    return (
      <section className="page">
        <h1>Урок не найден</h1>
        <Link to="/" className="button-link">
          Вернуться к учебному пути
        </Link>
      </section>
    );
  }

  if (!progress) {
    return (
      <section className="page">
        <p>Загружаем прогресс урока…</p>
      </section>
    );
  }

  const hasChecklistProgress = progress.checklistCheckedStates.some(Boolean);
  const status: StatusKey = progress.mastered
    ? "mastered"
    : progress.uploadedImage || hasChecklistProgress
      ? "in-progress"
      : "not-started";

  const updateProgress = async (next: UserProgress) => {
    setProgress(next);
    await saveProgress(next);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Пожалуйста, загрузите изображение (JPG, PNG или WebP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Файл слишком большой. Пожалуйста, загрузите изображение до 12 МБ.");
      return;
    }

    setError(null);

    const next: UserProgress = {
      ...progress,
      uploadedImage: file,
      mastered: progress.checklistCheckedStates.every(Boolean) && progress.checklistCheckedStates.length > 0,
      completedAt: progress.completedAt
    };

    if (next.mastered && !next.completedAt) {
      next.completedAt = new Date().toISOString();
    }

    await updateProgress(next);
  };

  const handleChecklistToggle = async (index: number) => {
    const nextChecks = [...progress.checklistCheckedStates];
    nextChecks[index] = !nextChecks[index];
    const mastered = nextChecks.every(Boolean) && Boolean(progress.uploadedImage);
    const next: UserProgress = {
      ...progress,
      checklistCheckedStates: nextChecks,
      mastered,
      completedAt: mastered ? progress.completedAt ?? new Date().toISOString() : progress.completedAt
    };
    await updateProgress(next);
  };

  return (
    <section className="page">
      <div className="page-header">
        <div className="lesson-header">
          <div>
            <h1>{lesson.title}</h1>
            <p>{lesson.concept}</p>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="lesson-content">
        <div className="lesson-section">
          <h2>Основная идея</h2>
          <p>{lesson.concept}</p>
        </div>
        <div className="lesson-section">
          <h2>Почему это важно</h2>
          <p>{lesson.whyItMatters}</p>
        </div>
        <div className="lesson-section">
          <h2>Практическая миссия</h2>
          <p>{lesson.mission}</p>
        </div>
        <div className="lesson-section">
          <h2>Пример</h2>
          <div className="example-card">
            <PlaceholderImage label="Пример-замена" />
            <div>
              <p className="example-label">Промпт для ИИ</p>
              <p>{lesson.examplePrompt}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lesson-section mission-section">
        <h2>Проверка миссии</h2>
        <p>Загрузите одно изображение из миссии и отметьте пункты чек-листа, чтобы получить статус «Освоено».</p>
        <div className="upload-panel">
          <label className="upload-button">
            Загрузить изображение
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          {error && <p className="error-text">{error}</p>}
          {previewUrl ? (
            <div className="upload-preview">
              <img src={previewUrl} alt={`Результат миссии: ${lesson.title}`} />
            </div>
          ) : (
            <p className="muted-text">Изображение ещё не загружено.</p>
          )}
        </div>
        <div className="checklist">
          {lesson.checklistItems.map((item, index) => (
            <label key={item} className="checklist-item">
              <input
                type="checkbox"
                checked={progress.checklistCheckedStates[index] ?? false}
                onChange={() => handleChecklistToggle(index)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <div className="lesson-status">
          <p>
            Статус: <strong>{status === "mastered" ? "Освоено" : status === "in-progress" ? "В процессе" : "Не начато"}</strong>
          </p>
          {status === "mastered" && progress.completedAt && (
            <p className="muted-text">Завершено {new Date(progress.completedAt).toLocaleDateString()}.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default LessonDetailPage;
