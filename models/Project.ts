import { Schema, models, model, Types } from "mongoose";

export interface IProject {
  userId: Types.ObjectId;
  name: string;
  startDate: string;
  endDate: string;
  createdAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    // The project's own statistics period — set at creation, editable afterward.
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Project || model<IProject>("Project", ProjectSchema);
