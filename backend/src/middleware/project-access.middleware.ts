import type { NextFunction, Request, Response } from "express";
import { ProjectModel } from "../models/project.model.js";
import { ApiError } from "../utils/api-error.js";

export async function requireProjectMember(req: Request, res: Response, next: NextFunction) {
  const projectId = req.params.id ?? req.params.projectId ?? req.body.projectId ?? req.query.projectId;
  if (!projectId || typeof projectId !== "string") {
    return next(new ApiError(400, "Project id is required"));
  }

  const project = await ProjectModel.findById(projectId).select("members");
  if (!project) return next(new ApiError(404, "Project not found"));
  const membership = project.members.find((member) => String(member.user) === req.user!.id);

  if (!membership) {
    return next(new ApiError(403, "Project access denied"));
  }

  res.locals.projectRole = membership.role;
  return next();
}

export async function requireProjectAdmin(req: Request, res: Response, next: NextFunction) {
  await requireProjectMember(req, res, (error?: unknown) => {
    if (error) return next(error);
    if (res.locals.projectRole !== "ADMIN") {
      return next(new ApiError(403, "Project admin access required"));
    }
    return next();
  });
}
