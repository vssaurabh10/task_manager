import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", authenticate, asyncHandler(getDashboardStats));
