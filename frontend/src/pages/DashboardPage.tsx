import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, Clock, FolderKanban, ListChecks } from "lucide-react";
import { dashboardApi } from "../api/endpoints";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/EmptyState";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import type { DashboardResponse } from "../types";
import { formatDate, label } from "../utils/format";

const colors = ["#0f172a", "#0284c7", "#10b981", "#f59e0b", "#e11d48"];

export function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi
      .stats()
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>;
  if (!data) return <div className="h-96 animate-pulse rounded-lg bg-slate-100" />;

  const cards = [
    { label: "Total tasks", value: data.stats.totalTasks, icon: ListChecks },
    { label: "Completed", value: data.stats.completedTasks, icon: CheckCircle2 },
    { label: "Pending", value: data.stats.pendingTasks, icon: Clock },
    { label: "Overdue", value: data.stats.overdueTasks, icon: AlertTriangle },
    { label: "Projects", value: data.stats.totalProjects, icon: FolderKanban }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Portfolio health, delivery status, and team throughput.</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((item) => (
          <Card className="p-4" key={item.label}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <item.icon className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Tasks by Status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.charts.tasksByStatus} dataKey="value" nameKey="name" outerRadius={88} label={(entry) => label(entry.name)}>
                {data.charts.tasksByStatus.map((_, index) => (
                  <Cell fill={colors[index % colors.length]} key={index} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, label(String(name))]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Tasks by Priority">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.charts.tasksByPriority}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickFormatter={label} />
              <YAxis allowDecimals={false} />
              <Tooltip labelFormatter={label} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="User Productivity">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.charts.userProductivity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="completed" radius={[0, 4, 4, 0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-4">
            <h2 className="font-semibold text-slate-950">Project Progress</h2>
          </div>
          <div className="divide-y divide-border">
            {data.projects.length === 0 && <div className="p-4"><EmptyState title="No projects yet" detail="Create a project to begin tracking progress." /></div>}
            {data.projects.map((project) => (
              <div className="grid gap-3 p-4 sm:grid-cols-[1fr_140px]" key={project.id}>
                <div>
                  <p className="font-semibold text-slate-950">{project.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{project.tasksCount} tasks · {project.membersCount} members · due {formatDate(project.deadline)}</p>
                </div>
                <div>
                  <p className="mb-1 text-right text-sm font-semibold">{project.progress}%</p>
                  <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-slate-900" style={{ width: `${project.progress}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-border p-4">
            <h2 className="font-semibold text-slate-950">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border">
            {data.activity.map((item) => (
              <div className="space-y-2 p-4" key={item.id}>
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  <PriorityBadge priority={item.priority} />
                </div>
                <p className="text-xs text-slate-500">{item.project.title} · {formatDate(item.updatedAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h2 className="mb-4 font-semibold text-slate-950">{title}</h2>
      {children}
    </Card>
  );
}
