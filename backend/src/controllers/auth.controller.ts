import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { UserModel, type UserDocument } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { safeUser } from "../utils/serialize.js";
import { signToken } from "../utils/auth.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 1000 * 60 * 60 * 24 * 7
};

function sendSession(res: Response, user: UserDocument) {
  const token = signToken({ id: String(user._id), email: user.email, role: user.role });
  res.cookie("token", token, cookieOptions);
  return res.status(200).json({ token, user: safeUser(user) });
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const existing = await UserModel.findOne({ email: data.email });
  if (existing) throw new ApiError(409, "Email is already registered");

  const user = await UserModel.create({
    name: data.name,
    email: data.email,
    password: await bcrypt.hash(data.password, 12),
    role: "MEMBER"
  });

  return sendSession(res, user);
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await UserModel.findOne({ email: data.email });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) throw new ApiError(401, "Invalid email or password");

  return sendSession(res, user);
}

export async function me(req: Request, res: Response) {
  const user = await UserModel.findById(req.user!.id);
  if (!user) throw new ApiError(404, "User not found");
  return res.json({ user: safeUser(user) });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", cookieOptions);
  return res.json({ message: "Logged out" });
}
