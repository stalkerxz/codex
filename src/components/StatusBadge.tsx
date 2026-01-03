type StatusKey = "not-started" | "in-progress" | "mastered";

type StatusBadgeProps = {
  status: StatusKey;
};

const statusLabels: Record<StatusKey, string> = {
  "not-started": "Не начато",
  "in-progress": "В процессе",
  mastered: "Освоено"
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <span className={`status-badge status-${status}`}>{statusLabels[status]}</span>;
};

export default StatusBadge;
export type { StatusKey };
