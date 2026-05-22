import { Schema, model, type HydratedDocument, type InferSchemaType, type Types } from "mongoose";

export type ProjectRole = "ADMIN" | "MEMBER";

const memberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    members: { type: [memberSchema], default: [] }
  },
  { timestamps: true }
);

projectSchema.index({ "members.user": 1 });

export type Project = InferSchemaType<typeof projectSchema> & { _id: Types.ObjectId };
export type ProjectDocument = HydratedDocument<Project>;
export const ProjectModel = model("Project", projectSchema);
