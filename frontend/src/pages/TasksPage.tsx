import { Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { taskApi } from "../api/endpoints";
import { EmptyState } from "../components/EmptyState";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { Task, TaskStatus } from "../types";
import { cn } from "../utils/cn";
import { formatDate, isOverdue, label } from "../utils/format";

const columns: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const { data } = await taskApi.list({ search: search || undefined, priority: priority || undefined });
    setTasks(data.tasks);
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      load().catch((err) => setError(err.message));
    }, 250);
    return () => window.clearTimeout(id);
  }, [search, priority]);

  async function moveTask(task: Task, status: TaskStatus) {
    const previous = tasks;
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, status } : item)));
    try {
      await taskApi.updateStatus(task.id, status);
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : "Could not update task");
    }
  }

  async function deleteTask(task: Task) {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;
    const previous = tasks;
    setTasks((current) => current.filter((item) => item.id !== task.id));
    try {
      await taskApi.remove(task.id);
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : "Could not delete task");
    }
  }

  const projectGroups = useMemo(() => {
    const groups = new Map<string, { id: string; title: string; tasks: Task[]; progress: number }>();
    for (const task of tasks) {
      const group = groups.get(task.project.id) ?? { id: task.project.id, title: task.project.title, tasks: [], progress: 0 };
      group.tasks.push(task);
      groups.set(task.project.id, group);
    }

    return Array.from(groups.values()).map((group) => {
      const completed = group.tasks.filter((task) => task.status === "DONE").length;
      return {
        ...group,
        progress: group.tasks.length ? Math.round((completed / group.tasks.length) * 100) : 0
      };
    });
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Task Board</h1>
        <p className="mt-1 text-sm text-slate-500">Search, filter, and update assignment status across projects.</p>
      </div>
      <Card className="grid gap-3 p-4 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <select className="h-10 rounded-md border border-border bg-white px-3 text-sm" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </Card>
      {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {tasks.length === 0 ? (
        <EmptyState title="No tasks found" detail="Tasks created from project pages will appear here." />
      ) : (
        <div className="space-y-5">
          {projectGroups.map((project) => (
            <ProjectTaskBoard key={project.id} project={project} onDelete={deleteTask} onMove={moveTask} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectTaskBoard({
  project,
  onDelete,
  onMove
}: {
  project: { id: string; title: string; tasks: Task[]; progress: number };
  onDelete: (task: Task) => void;
  onMove: (task: Task, status: TaskStatus) => void;
}) {
  const isProjectAdminView = project.tasks.some((task) => task.canManage);
  const grouped = columns.reduce<Record<TaskStatus, Task[]>>((acc, status) => {
    acc[status] = project.tasks.filter((task) => task.status === status);
    return acc;
  }, { TODO: [], IN_PROGRESS: [], DONE: [] });

  return (
    <section className="rounded-lg border border-border bg-white shadow-soft">
      <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[1fr_180px] md:items-center">
        <div>
          <h2 className="font-semibold text-slate-950">{project.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{project.tasks.length} assigned tasks</p>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-500">Progress</span>
            <span className="font-bold text-slate-950">{project.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-slate-900" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      </div>
      <div className="grid gap-4 bg-slate-50 p-4 xl:grid-cols-3">
        {columns.map((status) => (
          <section className="rounded-lg border border-border bg-slate-50" key={status}>
            <div className="flex items-center justify-between border-b border-border p-3">
              <h3 className="text-sm font-bold text-slate-900">{label(status)}</h3>
              <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-600">{grouped[status].length}</span>
            </div>
            <div className="space-y-3 p-3">
              {grouped[status].map((task) => (
                <TaskCard key={task.id} task={task} canDelete={isProjectAdminView} onDelete={onDelete} onMove={onMove} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function TaskCard({
  task,
  canDelete,
  onDelete,
  onMove
}: {
  task: Task;
  canDelete: boolean;
  onDelete: (task: Task) => void;
  onMove: (task: Task, status: TaskStatus) => void;
}) {
  return (
    <Card className={cn("p-4 shadow-none", isOverdue(task.dueDate, task.status) && "border-rose-200")}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-950">{task.title}</h3>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {canDelete && (
            <Button className="h-8 w-8 px-0" variant="ghost" onClick={() => onDelete(task)} aria-label="Delete task">
              <Trash2 className="h-4 w-4 text-rose-600" />
            </Button>
          )}
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{task.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={task.status} />
        {isOverdue(task.dueDate, task.status) && <span className="rounded bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Overdue</span>}
      </div>
      <div className="mt-4 text-xs text-slate-500">
        <p>{task.project.title}</p>
        <p>Due {formatDate(task.dueDate)} · {task.assignedTo?.name ?? "Unassigned"}</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {columns.map((status) => (
          <Button
            className="h-8 px-2 text-xs"
            variant={task.status === status ? "primary" : "secondary"}
            key={status}
            onClick={() => onMove(task, status)}
          >
            {label(status)}
          </Button>
        ))}
      </div>
    </Card>
  );
}
