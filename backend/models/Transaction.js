import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    storage: { type: mongoose.Schema.Types.ObjectId, ref: "Storage", required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "Borrower", required: true },
    debtRecord: { type: mongoose.Schema.Types.ObjectId, ref: "DebtRecord" },
    type: {
      type: String,
      enum: ["debt_created", "payment", "debt_cancelled", "borrower_cancelled"],
      required: true,
    },
    amount: { type: Number, default: 0 },
    description: { type: String, trim: true, default: "" },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
