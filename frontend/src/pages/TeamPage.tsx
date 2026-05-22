import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { projectApi } from "../api/endpoints";
import { EmptyState } from "../components/EmptyState";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { Project } from "../types";
import { formatDate } from "../utils/format";

export function TeamPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await projectApi.list();
      const details = await Promise.all(data.projects.map((project) => projectApi.get(project.id).then((response) => response.data.project)));
      setProjects(details);
    }

    load().catch((err) => setError(err instanceof Error ? err.message : "Could not load team members"));
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase();
    return projects
      .map((project) => ({
        ...project,
        members:
          project.members?.filter((member) =>
            `${member.user.name} ${member.user.email} ${member.role} ${project.title}`.toLowerCase().includes(query)
          ) ?? []
      }))
      .filter((project) => project.members.length > 0 || project.title.toLowerCase().includes(query));
  }, [projects, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Team Members</h1>
        <p className="mt-1 text-sm text-slate-500">Project-wise team directory with each member's project role.</p>
      </div>
      <Card className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search by project, person, email, or role" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </Card>
      {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {filteredProjects.length === 0 ? (
        <EmptyState title="No team members found" detail="Create a project and add members to see project-wise teams here." />
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card className="overflow-hidden" key={project.id}>
              <div className="grid gap-2 border-b border-border bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h2 className="font-semibold text-slate-950">{project.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{project.members?.length ?? 0} members - deadline {formatDate(project.deadline)}</p>
                </div>
                <span className="text-sm font-bold text-slate-900">{project.progress}% progress</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Project Role</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {project.members?.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-3 font-semibold text-slate-950">{member.user.name}</td>
                        <td className="px-4 py-3 text-slate-500">{member.user.email}</td>
                        <td className="px-4 py-3 text-slate-700">{member.role}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(member.joinedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
