import { Router } from "express";
import { listUsers } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const userRouter = Router();

userRouter.get("/", authenticate, asyncHandler(listUsers));
