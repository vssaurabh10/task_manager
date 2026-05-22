import { Router } from "express";
import {
  addMember,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeMember,
  updateProject
} from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { requireProjectAdmin, requireProjectMember } from "../middleware/project-access.middleware.js";

export const projectRouter = Router();

projectRouter.use(authenticate);
projectRouter.post("/", asyncHandler(createProject));
projectRouter.get("/", asyncHandler(listProjects));
projectRouter.get("/:id", asyncHandler(requireProjectMember), asyncHandler(getProject));
projectRouter.put("/:id", asyncHandler(requireProjectAdmin), asyncHandler(updateProject));
projectRouter.delete("/:id", asyncHandler(requireProjectAdmin), asyncHandler(deleteProject));
projectRouter.post("/:id/members", asyncHandler(requireProjectAdmin), asyncHandler(addMember));
projectRouter.delete("/:id/members/:userId", asyncHandler(requireProjectAdmin), asyncHandler(removeMember));
