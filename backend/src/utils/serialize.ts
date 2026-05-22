import type { TaskStatus } from "../models/task.model.js";

type AnyDoc = Record<string, any>;

export function idOf(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value!) return String((value as AnyDoc)._id);
  return String(value);
}

export function safeUser(user: AnyDoc) {
  return {
    id: idOf(user),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

export function projectProgress(tasks: { status: TaskStatus }[]) {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((task) => task.status === "DONE").length;
  return Math.round((done / tasks.length) * 100);
}

export function projectSummary(project: AnyDoc & { tasks: { status: TaskStatus }[]; members: unknown[] }) {
  return {
    id: idOf(project),
    title: project.title,
    description: project.description,
    deadline: project.deadline,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    progress: projectProgress(project.tasks),
    tasksCount: project.tasks.length,
    membersCount: project.members.length
  };
}
