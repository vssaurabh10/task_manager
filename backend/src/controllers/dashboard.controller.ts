import type { Request, Response } from "express";
import { ProjectModel } from "../models/project.model.js";
import { TaskModel } from "../models/task.model.js";
import { UserModel } from "../models/user.model.js";
import { idOf, projectProgress, safeUser } from "../utils/serialize.js";

export async function getDashboardStats(req: Request, res: Response) {
  const projects = await ProjectModel.find({ "members.user": req.user!.id }).sort({ updatedAt: -1 });

  const projectIds = projects.map((project) => project._id);
  const scope = { project: { $in: projectIds } };

  const [tasks, recentTasks, users] = await Promise.all([
    TaskModel.find(scope),
    TaskModel.find(scope)
      .populate("assignedTo", "name email role createdAt")
      .populate("project", "title")
      .sort({ updatedAt: -1 })
      .limit(8),
    UserModel.find({ _id: { $in: uniqueMemberIds(projects) } }).sort({ name: 1 }).limit(8)
  ]);

  const projectTaskMap = await Promise.all(
    projects.map(async (project) => ({
      project,
      tasks: await TaskModel.find({ project: project._id }).select("status")
    }))
  );

  const doneCounts = await Promise.all(
    users.map(async (user) => ({
      name: user.name,
      completed: await TaskModel.countDocuments({ ...scope, assignedTo: user._id, status: "DONE" })
    }))
  );

  const now = new Date();
  return res.json({
    stats: {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((task) => task.status === "DONE").length,
      pendingTasks: tasks.filter((task) => task.status !== "DONE").length,
      overdueTasks: tasks.filter((task) => task.status !== "DONE" && task.dueDate < now).length,
      totalProjects: projects.length
    },
    charts: {
      tasksByStatus: Object.entries(countBy(tasks, "status")).map(([name, value]) => ({ name, value })),
      tasksByPriority: Object.entries(countBy(tasks, "priority")).map(([name, value]) => ({ name, value })),
      userProductivity: doneCounts
    },
    projects: projectTaskMap.map(({ project, tasks }) => ({
      id: idOf(project),
      title: project.title,
      deadline: project.deadline,
      membersCount: project.members.length,
      tasksCount: tasks.length,
      progress: projectProgress(tasks)
    })),
    activity: recentTasks.map((task: any) => ({
      id: idOf(task),
      type: "TASK_UPDATED",
      title: task.title,
      status: task.status,
      priority: task.priority,
      project: { id: idOf(task.project), title: task.project?.title ?? "" },
      assignedTo: task.assignedTo ? safeUser(task.assignedTo) : null,
      updatedAt: task.updatedAt
    }))
  });
}

function countBy<T extends Record<string, any>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key]);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function uniqueMemberIds(projects: any[]) {
  return [...new Set(projects.flatMap((project) => project.members.map((member: any) => String(member.user))))];
}
