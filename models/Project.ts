import { Schema, models, model, Types } from "mongoose";

export interface IProject {
  userId: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  name: string;
  startDate: string;
  endDate: string;
  currency: string;
  createdAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    // userId = creator; updatedBy = last editor (projects are shared across the household).
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    // The project's own statistics period — set at creation, editable afterward.
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    // Every entry in the project is recorded in this currency (the general ledger is always TWD).
    currency: { type: String, required: true, default: "TWD" },
  },
  { timestamps: true }
);

export default models.Project || model<IProject>("Project", ProjectSchema);
