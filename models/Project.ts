import { Schema, models, model, Types } from "mongoose";

export interface IProject {
  userId: Types.ObjectId;
  name: string;
  createdAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default models.Project || model<IProject>("Project", ProjectSchema);
