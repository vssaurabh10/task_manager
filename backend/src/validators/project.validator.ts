import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(1).max(1000),
  deadline: z.coerce.date().refine((date) => !Number.isNaN(date.getTime()), "Invalid deadline"),
  memberEmails: z.array(z.string().email().toLowerCase()).optional().default([])
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  memberEmails: z.array(z.string().email().toLowerCase()).optional()
});

export const addMemberSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
});
