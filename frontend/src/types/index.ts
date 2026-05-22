export type Role = "ADMIN" | "MEMBER";
export type ProjectRole = "ADMIN" | "MEMBER";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type ProjectMember = {
  id: string;
  role: ProjectRole;
  joinedAt: string;
  user: User;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  project: { id: string; title: string };
  assignedTo: User | null;
  createdBy: User;
  canManage?: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  tasksCount?: number;
  membersCount?: number;
  tasks?: Task[];
  members?: ProjectMember[];
  createdBy?: User;
};

export type DashboardResponse = {
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    totalProjects: number;
  };
  charts: {
    tasksByStatus: { name: string; value: number }[];
    tasksByPriority: { name: string; value: number }[];
    userProductivity: { name: string; completed: number }[];
  };
  projects: Project[];
  activity: Array<{
    id: string;
    type: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    project: { id: string; title: string };
    assignedTo: User | null;
    updatedAt: string;
  }>;
};
