import mongoose from "mongoose";

// A Borrower is a debtor "folder" the Store Owner creates inside their Storage.
const borrowerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactNumber: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    storage: { type: mongoose.Schema.Types.ObjectId, ref: "Storage", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Borrower", borrowerSchema);
