import type { Request, Response } from "express";
import { ProjectModel } from "../models/project.model.js";
import { TaskModel } from "../models/task.model.js";
import { UserModel } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { idOf, projectProgress, projectSummary, safeUser } from "../utils/serialize.js";
import { addMemberSchema, createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";

const populateProject = [
  { path: "createdBy", select: "name email role createdAt" },
  { path: "members.user", select: "name email role createdAt" }
];

export async function createProject(req: Request, res: Response) {
  const data = createProjectSchema.parse(req.body);
  const memberUsers = data.memberEmails.length ? await UserModel.find({ email: { $in: data.memberEmails } }) : [];

  const members = [
    { user: req.user!.id, role: "ADMIN" as const },
    ...memberUsers.filter((user) => String(user._id) !== req.user!.id).map((user) => ({ user: user._id, role: "MEMBER" as const }))
  ];

  const project = await ProjectModel.create({
    title: data.title,
    description: data.description,
    deadline: data.deadline,
    createdBy: req.user!.id,
    members
  });

  const hydrated = await ProjectModel.findById(project._id).populate(populateProject);
  return res.status(201).json({ project: await formatProject(hydrated!) });
}

export async function listProjects(req: Request, res: Response) {
  const filter = { "members.user": req.user!.id };
  const projects = await ProjectModel.find(filter).sort({ updatedAt: -1 });
  const summaries = await Promise.all(
    projects.map(async (project) => {
      const tasks = await TaskModel.find({ project: project._id }).select("status");
      return projectSummary({ ...project.toObject(), tasks, members: project.members });
    })
  );

  return res.json({ projects: summaries });
}

export async function getProject(req: Request, res: Response) {
  const project = await ProjectModel.findById(req.params.id).populate(populateProject);
  if (!project) throw new ApiError(404, "Project not found");

  return res.json({ project: await formatProject(project) });
}

export async function updateProject(req: Request, res: Response) {
  const data = updateProjectSchema.parse(req.body);
  const project = await ProjectModel.findByIdAndUpdate(
    req.params.id,
    {
      ...(data.title ? { title: data.title } : {}),
      ...(data.description ? { description: data.description } : {}),
      ...(data.deadline ? { deadline: data.deadline } : {})
    },
    { new: true }
  ).populate(populateProject);
  if (!project) throw new ApiError(404, "Project not found");

  return res.json({ project: await formatProject(project) });
}

export async function deleteProject(req: Request, res: Response) {
  const project = await ProjectModel.findByIdAndDelete(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  await TaskModel.deleteMany({ project: req.params.id });
  return res.status(204).send();
}

export async function addMember(req: Request, res: Response) {
  const data = addMemberSchema.parse(req.body);
  const user = await UserModel.findOne({ email: data.email });
  if (!user) throw new ApiError(404, "User not found");

  const project = await ProjectModel.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");

  const existing = project.members.find((member) => String(member.user) === String(user._id));
  if (existing) {
    existing.role = data.role;
  } else {
    project.members.push({ user: user._id, role: data.role, joinedAt: new Date() });
  }
  await project.save();

  const membership = project.members.find((member) => String(member.user) === String(user._id))!;
  return res.status(201).json({
    member: {
      id: idOf(membership),
      role: membership.role,
      joinedAt: membership.joinedAt,
      user: safeUser(user)
    }
  });
}

export async function removeMember(req: Request, res: Response) {
  const project = await ProjectModel.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");

  const target = project.members.find((member) => String(member.user) === req.params.userId);
  const adminCount = project.members.filter((member) => member.role === "ADMIN").length;
  if (target?.role === "ADMIN" && adminCount <= 1) {
    throw new ApiError(400, "A project must keep at least one admin");
  }

  project.members.pull(target?._id);
  await project.save();
  await TaskModel.updateMany({ project: project._id, assignedTo: req.params.userId }, { $set: { assignedTo: null } });
  return res.status(204).send();
}

async function formatProject(project: any) {
  const tasks = await TaskModel.find({ project: project._id })
    .populate("assignedTo", "name email role createdAt")
    .populate("createdBy", "name email role createdAt")
    .populate("project", "title")
    .sort({ createdAt: -1 });

  return {
    id: idOf(project),
    title: project.title,
    description: project.description,
    deadline: project.deadline,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    createdBy: safeUser(project.createdBy),
    progress: projectProgress(tasks),
    tasks: tasks.map((task) => ({
      id: idOf(task),
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      project: { id: idOf(project), title: project.title },
      assignedTo: task.assignedTo ? safeUser(task.assignedTo) : null,
      createdBy: safeUser(task.createdBy)
    })),
    members: project.members.map((member: any) => ({
      id: idOf(member),
      role: member.role,
      joinedAt: member.joinedAt,
      user: safeUser(member.user)
    }))
  };
}
