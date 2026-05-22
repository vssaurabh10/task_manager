import { z } from "zod";

export const taskQuerySchema = z.object({
  projectId: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assignedToId: z.string().optional(),
  search: z.string().optional(),
  overdue: z.coerce.boolean().optional()
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().min(1).max(1200),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  dueDate: z.coerce.date(),
  assignedToId: z.string().nullable().optional(),
  projectId: z.string()
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"])
});
