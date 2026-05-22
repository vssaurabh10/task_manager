import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
};

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
