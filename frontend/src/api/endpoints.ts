import { api } from "./client";
import type { DashboardResponse, Project, ProjectMember, Task, TaskStatus, User } from "../types";

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/register", payload),
  login: (payload: { email: string; password: string }) => api.post<{ token: string; user: User }>("/auth/login", payload),
  me: () => api.get<{ user: User }>("/auth/me"),
  logout: () => api.post("/auth/logout")
};

export const projectApi = {
  list: () => api.get<{ projects: Project[] }>("/projects"),
  get: (id: string) => api.get<{ project: Project }>("/projects/" + id),
  create: (payload: { title: string; description: string; deadline: string; memberEmails: string[] }) =>
    api.post<{ project: Project }>("/projects", payload),
  remove: (id: string) => api.delete("/projects/" + id),
  addMember: (projectId: string, payload: { email: string; role: "ADMIN" | "MEMBER" }) =>
    api.post<{ member: ProjectMember }>(`/projects/${projectId}/members`, payload),
  removeMember: (projectId: string, userId: string) => api.delete(`/projects/${projectId}/members/${userId}`)
};

export const taskApi = {
  list: (params?: Record<string, string | boolean | undefined>) => api.get<{ tasks: Task[] }>("/tasks", { params }),
  create: (payload: {
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: TaskStatus;
    dueDate: string;
    assignedToId?: string;
    projectId: string;
  }) => api.post<{ task: Task }>("/tasks", payload),
  updateStatus: (id: string, status: TaskStatus) => api.patch<{ task: Task }>(`/tasks/${id}/status`, { status }),
  remove: (id: string) => api.delete(`/tasks/${id}`)
};

export const dashboardApi = {
  stats: () => api.get<DashboardResponse>("/dashboard/stats")
};

export const userApi = {
  list: () => api.get<{ users: User[] }>("/users")
};
