import { Link } from "react-router-dom";
import { Lesson } from "../data/types";
import StatusBadge from "./StatusBadge";

type LessonCardProps = {
  lesson: Lesson;
  status: "Not Started" | "In Progress" | "Mastered";
};

const LessonCard = ({ lesson, status }: LessonCardProps) => {
  return (
    <div className="lesson-card">
      <div>
        <h3>{lesson.title}</h3>
        <p>{lesson.concept}</p>
      </div>
      <div className="lesson-card-footer">
        <StatusBadge status={status} />
        <Link to={`/lesson/${lesson.id}`} className="button-link">
          Open Lesson
        </Link>
      </div>
    </div>
  );
};

export default LessonCard;
