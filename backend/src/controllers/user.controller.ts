import type { Request, Response } from "express";
import { ProjectModel } from "../models/project.model.js";
import { UserModel } from "../models/user.model.js";
import { safeUser } from "../utils/serialize.js";

export async function listUsers(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search : "";
  const users = await UserModel.find(
    search ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] } : {}
  )
    .sort({ name: 1 })
    .limit(50);

  const adminProjects = await ProjectModel.find({ "members.role": "ADMIN" }).select("members");
  const projectAdminIds = new Set(
    adminProjects.flatMap((project) =>
      project.members.filter((member) => member.role === "ADMIN").map((member) => String(member.user))
    )
  );

  return res.json({
    users: users.map((user) => ({
      ...safeUser(user),
      role: user.role === "ADMIN" || projectAdminIds.has(String(user._id)) ? "ADMIN" : "MEMBER"
    }))
  });
}
