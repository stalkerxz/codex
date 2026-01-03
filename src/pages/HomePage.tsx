import { useEffect, useMemo, useState } from "react";
import { lessons } from "../data/lessons";
import { UserProgress } from "../data/types";
import { listAllProgress } from "../db/indexedDb";
import LessonCard from "../components/LessonCard";

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

  const getStatus = (lessonId: string) => {
    const progress = progressMap.get(lessonId);
    if (!progress) return "Not Started" as const;
    if (progress.mastered) return "Mastered" as const;
    return "In Progress" as const;
  };

  return (
    <section className="page">
      <div className="page-header">
        <h1>Learning Path</h1>
        <p>
          Five foundational lessons. Each mission is designed to train your eye offline and keep your progress stored on
          your device.
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
