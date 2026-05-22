import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus
} from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const taskRouter = Router();

taskRouter.use(authenticate);
taskRouter.post("/", asyncHandler(createTask));
taskRouter.get("/", asyncHandler(listTasks));
taskRouter.get("/:id", asyncHandler(getTask));
taskRouter.put("/:id", asyncHandler(updateTask));
taskRouter.delete("/:id", asyncHandler(deleteTask));
taskRouter.patch("/:id/status", asyncHandler(updateTaskStatus));
