import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { projectApi, userApi } from "../api/endpoints";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import type { Project, User } from "../types";
import { formatDate } from "../utils/format";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(1),
  deadline: z.string().min(1),
  memberEmails: z.array(z.string().email()).default([])
});

type FormValues = z.infer<typeof schema>;

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function load() {
    const [projectsResponse, usersResponse] = await Promise.all([projectApi.list(), userApi.list()]);
    setProjects(projectsResponse.data.projects);
    setUsers(usersResponse.data.users);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function onSubmit(values: FormValues) {
    const { data } = await projectApi.create({ ...values, memberEmails: values.memberEmails });
    setProjects((current) => [data.project, ...current]);
    form.reset();
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Create initiatives, assign members, and track delivery progress.</p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>
      {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {showForm && (
        <Card className="p-4">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <Input placeholder="Project name" {...form.register("title")} />
            <Input type="date" {...form.register("deadline")} />
            <Textarea className="lg:col-span-2" placeholder="Description" {...form.register("description")} />
            <label className="lg:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Team members</span>
              <select
                multiple
                className="min-h-32 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                {...form.register("memberEmails")}
              >
                {users.map((user) => (
                  <option value={user.email} key={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-slate-500">Hold Ctrl or Shift to select multiple members.</span>
            </label>
            <Button className="lg:w-fit" disabled={form.formState.isSubmitting}>Create project</Button>
          </form>
        </Card>
      )}
      {projects.length === 0 ? (
        <EmptyState title="No projects found" detail="Create your first project to activate the workspace." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link to={`/app/projects/${project.id}`} key={project.id}>
              <Card className="h-full p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-slate-950">{project.title}</h2>
                  <span className="text-sm font-bold text-slate-900">{project.progress}%</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{project.description}</p>
                <div className="mt-5 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-slate-900" style={{ width: `${project.progress}%` }} /></div>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <Stat label="Members" value={project.membersCount ?? 0} />
                  <Stat label="Tasks" value={project.tasksCount ?? 0} />
                  <Stat label="Deadline" value={formatDate(project.deadline)} />
                </dl>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 truncate font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
