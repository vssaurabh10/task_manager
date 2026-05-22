import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { verifyToken } from "../utils/auth.js";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    const token = bearer ?? req.cookies?.token;

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.id).select("email role name");

    if (!user) {
      throw new ApiError(401, "Invalid session");
    }

    req.user = { id: String(user._id), email: user.email, role: user.role, name: user.name };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

export function requireGlobalAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return next(new ApiError(403, "Admin access required"));
  }

  return next();
}
