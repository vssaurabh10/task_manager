import { Schema, model, type HydratedDocument, type InferSchemaType, type Types } from "mongoose";

export type GlobalRole = "ADMIN" | "MEMBER";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER", index: true }
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const value = ret as Record<string, unknown>;
    value.id = String(value._id);
    delete value._id;
    delete value.password;
    return ret;
  }
});

export type User = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId };
export type UserDocument = HydratedDocument<User>;
export const UserModel = model("User", userSchema);
