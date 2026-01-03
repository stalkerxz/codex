type StatusBadgeProps = {
  status: "Not Started" | "In Progress" | "Mastered";
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <span className={`status-badge status-${status.replace(" ", "-")}`}>{status}</span>;
};

export default StatusBadge;
