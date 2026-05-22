import { Schema, model, type HydratedDocument, type InferSchemaType, type Types } from "mongoose";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, required: true, trim: true, index: "text" },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM", index: true },
    status: { type: String, enum: ["TODO", "IN_PROGRESS", "DONE"], default: "TODO", index: true },
    dueDate: { type: Date, required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });

export type Task = InferSchemaType<typeof taskSchema> & { _id: Types.ObjectId };
export type TaskDocument = HydratedDocument<Task>;
export const TaskModel = model("Task", taskSchema);
