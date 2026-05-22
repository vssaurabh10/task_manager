import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { ProjectModel } from "./models/project.model.js";
import { TaskModel } from "./models/task.model.js";
import { UserModel } from "./models/user.model.js";

async function main() {
  await connectDatabase();
  const password = await bcrypt.hash("password123", 12);

  const admin = await UserModel.findOneAndUpdate(
    { email: "admin@teamtask.dev" },
    { $setOnInsert: { name: "Avery Admin", email: "admin@teamtask.dev", password, role: "ADMIN" } },
    { upsert: true, new: true }
  );

  const member = await UserModel.findOneAndUpdate(
    { email: "member@teamtask.dev" },
    { $setOnInsert: { name: "Mina Member", email: "member@teamtask.dev", password, role: "MEMBER" } },
    { upsert: true, new: true }
  );

  let project = await ProjectModel.findOne({ title: "Operations Portal Rollout" });
  if (!project) {
    project = await ProjectModel.create({
      title: "Operations Portal Rollout",
      description: "ERP-style task workspace for cross-functional launch tracking.",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
      createdBy: admin._id,
      members: [
        { user: admin._id, role: "ADMIN" },
        { user: member._id, role: "MEMBER" }
      ]
    });
  }

  const taskCount = await TaskModel.countDocuments({ project: project._id });
  if (taskCount === 0) {
    await TaskModel.create([
      {
        title: "Finalize project charter",
        description: "Lock scope, owners, and launch KPIs.",
        priority: "HIGH",
        status: "DONE",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        project: project._id,
        createdBy: admin._id,
        assignedTo: admin._id
      },
      {
        title: "Configure team permissions",
        description: "Map admin and member access for the launch team.",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
        project: project._id,
        createdBy: admin._id,
        assignedTo: member._id
      },
      {
        title: "Prepare analytics review",
        description: "Create dashboard narrative for weekly steering review.",
        priority: "LOW",
        status: "TODO",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
        project: project._id,
        createdBy: admin._id,
        assignedTo: member._id
      }
    ]);
  }
}

main()
  .then(async () => {
    await disconnectDatabase();
    console.log("Seed data ready");
  })
  .catch(async (error) => {
    console.error(error);
    await disconnectDatabase();
    process.exit(1);
  });
