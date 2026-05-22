import type { TaskPriority, TaskStatus } from "../types";
import { label } from "../utils/format";
import { Badge } from "./ui/Badge";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const tone = status === "DONE" ? "green" : status === "IN_PROGRESS" ? "blue" : "slate";
  return <Badge tone={tone}>{label(status)}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const tone = priority === "HIGH" ? "red" : priority === "MEDIUM" ? "amber" : "green";
  return <Badge tone={tone}>{label(priority)}</Badge>;
}
