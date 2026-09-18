import { Schema, models, model, Types } from "mongoose";

export interface IExpense {
  userId: Types.ObjectId;
  rawText: string;
  amount: number;
  currency: string;
  category: string;
  item: string;
  merchant?: string;
  date: string;
  note?: string;
  confidence?: number;
  createdAt?: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rawText: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "TWD" },
    category: { type: String, required: true },
    item: { type: String, required: true },
    merchant: { type: String, default: "" },
    date: { type: String, required: true },
    note: { type: String, default: "" },
    confidence: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default models.Expense || model<IExpense>("Expense", ExpenseSchema);
