import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { projectApi, taskApi } from "../api/endpoints";
import { EmptyState } from "../components/EmptyState";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { useAuthStore } from "../store/auth-store";
import type { Project } from "../types";
import { formatDate } from "../utils/format";

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().min(1),
  assignedToId: z.string().optional()
});

const memberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"])
});

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const taskForm = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: "" }
  });
  const memberForm = useForm<z.infer<typeof memberSchema>>({ resolver: zodResolver(memberSchema), defaultValues: { role: "MEMBER" } });

  async function load() {
    if (!id) return;
    const { data } = await projectApi.get(id);
    setProject(data.project);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [id]);

  const myMembership = project?.members?.find((member) => member.user.id === user?.id);
  const canAdmin = myMembership?.role === "ADMIN";

  async function createTask(values: z.infer<typeof taskSchema>) {
    if (!id) return;
    await taskApi.create({ ...values, projectId: id, status: "TODO", assignedToId: values.assignedToId || undefined });
    taskForm.reset({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: "" });
    await load();
  }

  async function addMember(values: z.infer<typeof memberSchema>) {
    if (!id) return;
    await projectApi.addMember(id, values);
    memberForm.reset({ role: "MEMBER" });
    await load();
  }

  async function removeMember(userId: string) {
    if (!id) return;
    await projectApi.removeMember(id, userId);
    await load();
  }

  async function deleteProject() {
    if (!id) return;
    const confirmed = window.confirm("Delete this project and all of its tasks?");
    if (!confirmed) return;
    await projectApi.remove(id);
    navigate("/app/projects");
  }

  async function deleteTask(taskId: string) {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;
    await taskApi.remove(taskId);
    await load();
  }

  if (error) return <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>;
  if (!project) return <div className="h-96 animate-pulse rounded-lg bg-slate-100" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">{project.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">{project.description}</p>
          </div>
        </div>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Progress</span>
            <span className="text-xl font-bold">{project.progress}%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-slate-900" style={{ width: `${project.progress}%` }} /></div>
          <p className="mt-3 text-sm text-slate-500">Deadline {formatDate(project.deadline)}</p>
          {canAdmin && (
            <div className="mt-4 border-t border-border pt-4">
              <Button className="w-full justify-center" variant="danger" onClick={deleteProject}>
                <Trash2 className="h-4 w-4" />
                Delete project
              </Button>
            </div>
          )}
        </Card>
      </div>
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {canAdmin && (
            <Card className="p-4">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-950"><Plus className="h-4 w-4" /> Create Task</h2>
              <form className="grid gap-3 md:grid-cols-2" onSubmit={taskForm.handleSubmit(createTask)}>
                <Input placeholder="Task title" {...taskForm.register("title")} />
                <Input type="date" {...taskForm.register("dueDate")} />
                <Textarea className="md:col-span-2" placeholder="Description" {...taskForm.register("description")} />
                <select className="h-10 rounded-md border border-border bg-white px-3 text-sm" {...taskForm.register("priority")}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <select className="h-10 rounded-md border border-border bg-white px-3 text-sm" {...taskForm.register("assignedToId")}>
                  <option value="">Unassigned</option>
                  {project.members?.map((member) => <option value={member.user.id} key={member.user.id}>{member.user.name}</option>)}
                </select>
                <Button className="md:w-fit" disabled={taskForm.formState.isSubmitting}>Add task</Button>
              </form>
            </Card>
          )}
          <Card className="overflow-hidden">
            <div className="border-b border-border p-4"><h2 className="font-semibold text-slate-950">Tasks</h2></div>
            <div className="divide-y divide-border">
              {project.tasks?.length === 0 && <div className="p-4"><EmptyState title="No tasks" detail="Create tasks to start tracking delivery." /></div>}
              {project.tasks?.map((task) => (
                <div className="grid gap-3 p-4 md:grid-cols-[1fr_auto]" key={task.id}>
                  <div>
                    <p className="font-semibold text-slate-950">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{task.description}</p>
                    <p className="mt-2 text-xs text-slate-500">Assigned to {task.assignedTo?.name ?? "Unassigned"} · due {formatDate(task.dueDate)}</p>
                  </div>
                  <div className="flex flex-wrap items-start justify-end gap-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    {canAdmin && (
                      <Button className="h-8 w-8 px-0" variant="ghost" onClick={() => deleteTask(task.id)} aria-label="Delete task">
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          {canAdmin && (
            <Card className="p-4">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-950"><UserPlus className="h-4 w-4" /> Add Member</h2>
              <form className="space-y-3" onSubmit={memberForm.handleSubmit(addMember)}>
                <Input placeholder="member@example.com" {...memberForm.register("email")} />
                <select className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm" {...memberForm.register("role")}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <Button className="w-full" disabled={memberForm.formState.isSubmitting}>Add member</Button>
              </form>
            </Card>
          )}
          <Card className="overflow-hidden">
            <div className="border-b border-border p-4"><h2 className="font-semibold text-slate-950">Team Members</h2></div>
            <div className="divide-y divide-border">
              {project.members?.map((member) => (
                <div className="flex items-center justify-between gap-3 p-4" key={member.id}>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{member.user.name}</p>
                    <p className="text-xs text-slate-500">{member.user.email} · {member.role}</p>
                  </div>
                  {canAdmin && member.user.id !== user?.id && (
                    <Button className="h-8 w-8 px-0" variant="ghost" onClick={() => removeMember(member.user.id)} aria-label="Remove member">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
