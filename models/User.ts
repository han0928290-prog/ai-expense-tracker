import { Schema, models, model } from "mongoose";

export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

export interface IUser {
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  createdAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ROLES, default: "user" },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
