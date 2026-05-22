import type { Request, Response } from "express";
import { ProjectModel } from "../models/project.model.js";
import { TaskModel, type TaskStatus } from "../models/task.model.js";
import { ApiError } from "../utils/api-error.js";
import { idOf, safeUser } from "../utils/serialize.js";
import { createTaskSchema, taskQuerySchema, updateStatusSchema, updateTaskSchema } from "../validators/task.validator.js";

const populateTask = [
  { path: "project", select: "title" },
  { path: "assignedTo", select: "name email role createdAt" },
  { path: "createdBy", select: "name email role createdAt" }
];

export async function createTask(req: Request, res: Response) {
  const data = createTaskSchema.parse(req.body);
  await assertCanManageProject(req.user!.id, req.user!.role, data.projectId);

  if (data.assignedToId) {
    await assertProjectMember(data.projectId, data.assignedToId);
  }

  const created = await TaskModel.create({
    title: data.title,
    description: data.description,
    priority: data.priority,
    status: data.status,
    dueDate: data.dueDate,
    assignedTo: data.assignedToId ?? null,
    project: data.projectId,
    createdBy: req.user!.id
  });

  const task = await TaskModel.findById(created._id).populate(populateTask);
  return res.status(201).json({ task: formatTask(task) });
}

export async function listTasks(req: Request, res: Response) {
  const query = taskQuerySchema.parse(req.query);
  const accessibleProjects = await ProjectModel.find({ "members.user": req.user!.id }).select("_id members");
  const accessibleProjectIds = accessibleProjects.map((project) => project._id);
  const adminProjectIds = accessibleProjects
    .filter((project) => project.members.some((member) => String(member.user) === req.user!.id && member.role === "ADMIN"))
    .map((project) => project._id);

  const andFilters: Record<string, unknown>[] = [
    {
      $or: [
        { project: { $in: adminProjectIds } },
        { project: { $in: accessibleProjectIds }, assignedTo: req.user!.id }
      ]
    }
  ];

  if (query.projectId) andFilters.push({ project: query.projectId });
  if (query.status) andFilters.push({ status: query.status });
  if (query.priority) andFilters.push({ priority: query.priority });
  if (query.assignedToId) andFilters.push({ assignedTo: query.assignedToId });
  if (query.search) andFilters.push({ $or: [{ title: new RegExp(query.search, "i") }, { description: new RegExp(query.search, "i") }] });
  if (query.overdue) andFilters.push({ dueDate: { $lt: new Date() }, status: { $ne: "DONE" } });

  const filter = { $and: andFilters };

  const tasks = await TaskModel.find(filter).populate(populateTask).sort({ dueDate: 1, updatedAt: -1 });
  const adminProjectIdSet = new Set(adminProjectIds.map((projectId) => String(projectId)));
  return res.json({
    tasks: tasks.map((task) => ({
      ...formatTask(task),
      canManage: adminProjectIdSet.has(idOf((task as any).project))
    }))
  });
}

export async function getTask(req: Request, res: Response) {
  const task = await TaskModel.findById(req.params.id).populate(populateTask);
  if (!task) throw new ApiError(404, "Task not found");
  await assertCanViewProject(req.user!.id, req.user!.role, idOf((task as any).project));

  return res.json({ task: formatTask(task) });
}

export async function updateTask(req: Request, res: Response) {
  const existing = await TaskModel.findById(req.params.id);
  if (!existing) throw new ApiError(404, "Task not found");

  const data = updateTaskSchema.parse(req.body);
  const targetProjectId = data.projectId ?? idOf(existing.project);
  const canManage = await canManageProject(req.user!.id, req.user!.role, idOf(existing.project));
  const isAssignee = idOf(existing.assignedTo) === req.user!.id;

  if (!canManage && !isAssignee) {
    throw new ApiError(403, "You can only update assigned task progress");
  }

  if (!canManage) {
    const allowed = Object.keys(data).every((key) => key === "status");
    if (!allowed) throw new ApiError(403, "Members can only update task status");
  }

  if (data.assignedToId) {
    await assertProjectMember(targetProjectId, data.assignedToId);
  }

  const updated = await TaskModel.findByIdAndUpdate(
    req.params.id,
    {
      ...(data.title ? { title: data.title } : {}),
      ...(data.description ? { description: data.description } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.dueDate ? { dueDate: data.dueDate } : {}),
      ...(data.assignedToId !== undefined ? { assignedTo: data.assignedToId } : {}),
      ...(data.projectId ? { project: data.projectId } : {})
    },
    { new: true }
  ).populate(populateTask);

  return res.json({ task: formatTask(updated) });
}

export async function deleteTask(req: Request, res: Response) {
  const task = await TaskModel.findById(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");
  await assertCanManageProject(req.user!.id, req.user!.role, idOf(task.project));

  await task.deleteOne();
  return res.status(204).send();
}

export async function updateTaskStatus(req: Request, res: Response) {
  const data = updateStatusSchema.parse(req.body);
  const task = await TaskModel.findById(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");

  const canManage = await canManageProject(req.user!.id, req.user!.role, idOf(task.project));
  if (!canManage && idOf(task.assignedTo) !== req.user!.id) {
    throw new ApiError(403, "Only project admins or the assignee can update status");
  }

  const updated = await TaskModel.findByIdAndUpdate(req.params.id, { status: data.status }, { new: true }).populate(populateTask);
  return res.json({ task: formatTask(updated) });
}

async function assertProjectMember(projectId: string, userId: string) {
  const project = await ProjectModel.findOne({ _id: projectId, "members.user": userId });
  if (!project) throw new ApiError(400, "Assigned user must belong to the project");
}

async function canManageProject(userId: string, globalRole: string, projectId: string) {
  const project = await ProjectModel.findById(projectId).select("members");
  return Boolean(project?.members.some((member) => String(member.user) === userId && member.role === "ADMIN"));
}

async function assertCanManageProject(userId: string, globalRole: string, projectId: string) {
  if (!(await canManageProject(userId, globalRole, projectId))) {
    throw new ApiError(403, "Project admin access required");
  }
}

async function assertCanViewProject(userId: string, globalRole: string, projectId: string) {
  const project = await ProjectModel.findOne({ _id: projectId, "members.user": userId });
  if (!project) throw new ApiError(403, "Project access denied");
}

function formatTask(task: any) {
  if (!task) return null;
  return {
    id: idOf(task),
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status as TaskStatus,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    project: { id: idOf(task.project), title: task.project?.title ?? "" },
    assignedTo: task.assignedTo ? safeUser(task.assignedTo) : null,
    createdBy: safeUser(task.createdBy)
  };
}
