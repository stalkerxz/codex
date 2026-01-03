import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { lessons } from "../data/lessons";
import { Lesson, UserProgress } from "../data/types";
import { getProgress, saveProgress } from "../db/indexedDb";
import StatusBadge from "../components/StatusBadge";
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
        <h1>Lesson not found</h1>
        <Link to="/" className="button-link">
          Back to learning path
        </Link>
      </section>
    );
  }

  if (!progress) {
    return (
      <section className="page">
        <p>Loading lesson progress…</p>
      </section>
    );
  }

  const hasChecklistProgress = progress.checklistCheckedStates.some(Boolean);
  const status = progress.mastered
    ? "Mastered"
    : progress.uploadedImage || hasChecklistProgress
      ? "In Progress"
      : "Not Started";

  const updateProgress = async (next: UserProgress) => {
    setProgress(next);
    await saveProgress(next);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Please keep uploads under 12MB.");
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
          <h2>The Core Concept</h2>
          <p>{lesson.concept}</p>
        </div>
        <div className="lesson-section">
          <h2>Why It Matters</h2>
          <p>{lesson.whyItMatters}</p>
        </div>
        <div className="lesson-section">
          <h2>Practical Mission</h2>
          <p>{lesson.mission}</p>
        </div>
        <div className="lesson-section">
          <h2>Example</h2>
          <div className="example-card">
            <PlaceholderImage label="Example Placeholder" />
            <div>
              <p className="example-label">AI Image Prompt</p>
              <p>{lesson.examplePrompt}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lesson-section mission-section">
        <h2>Mission Verification</h2>
        <p>Upload one image from your mission and verify each checklist item to earn mastery.</p>
        <div className="upload-panel">
          <label className="upload-button">
            Upload Mission Image
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          {error && <p className="error-text">{error}</p>}
          {previewUrl ? (
            <div className="upload-preview">
              <img src={previewUrl} alt={`Uploaded result for ${lesson.title}`} />
            </div>
          ) : (
            <p className="muted-text">No image uploaded yet.</p>
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
            Status: <strong>{status}</strong>
          </p>
          {status === "Mastered" && progress.completedAt && (
            <p className="muted-text">Completed on {new Date(progress.completedAt).toLocaleDateString()}.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default LessonDetailPage;
