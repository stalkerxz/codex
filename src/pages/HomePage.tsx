import { useEffect, useMemo, useState } from "react";
import { lessons } from "../data/lessons";
import { UserProgress } from "../data/types";
import { listAllProgress } from "../db/indexedDb";
import LessonCard from "../components/LessonCard";
import { StatusKey } from "../components/StatusBadge";

const HomePage = () => {
  const [progressList, setProgressList] = useState<UserProgress[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await listAllProgress();
      setProgressList(data);
    };
    load();
  }, []);

  const progressMap = useMemo(() => {
    return new Map(progressList.map((item) => [item.lessonId, item]));
  }, [progressList]);

  const getStatus = (lessonId: string): StatusKey => {
    const progress = progressMap.get(lessonId);
    if (!progress) return "not-started";
    if (progress.mastered) return "mastered";
    return "in-progress";
  };

  return (
    <section className="page">
      <div className="page-header">
        <h1>Учебный путь</h1>
        <p>
          Пять базовых уроков. Каждая миссия тренирует взгляд и хранит ваш прогресс прямо на устройстве.
        </p>
      </div>
      <div className="lesson-grid">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} status={getStatus(lesson.id)} />
        ))}
      </div>
    </section>
  );
};

export default HomePage;
