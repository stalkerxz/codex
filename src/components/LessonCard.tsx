import { Link } from "react-router-dom";
import { Lesson } from "../data/types";
import StatusBadge, { StatusKey } from "./StatusBadge";

type LessonCardProps = {
  lesson: Lesson;
  status: StatusKey;
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
          Открыть урок
        </Link>
      </div>
    </div>
  );
};

export default LessonCard;
