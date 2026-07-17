import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    paidAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const debtRecordSchema = new mongoose.Schema(
  {
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "Borrower", required: true },
    storage: { type: mongoose.Schema.Types.ObjectId, ref: "Storage", required: true },
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 }, // quantity * unitPrice
    amountPaid: { type: Number, default: 0, min: 0 },
    payments: [paymentSchema],
    dateBorrowed: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["unpaid", "partial", "paid", "overdue"], default: "unpaid" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Keep status in sync whenever the doc is saved
debtRecordSchema.pre("save", function (next) {
  const balance = this.totalAmount - this.amountPaid;
  if (balance <= 0) {
    this.status = "paid";
  } else if (this.amountPaid > 0) {
    this.status = new Date() > this.dueDate ? "overdue" : "partial";
  } else {
    this.status = new Date() > this.dueDate ? "overdue" : "unpaid";
  }
  next();
});

debtRecordSchema.virtual("balance").get(function () {
  return Math.max(this.totalAmount - this.amountPaid, 0);
});

debtRecordSchema.set("toJSON", { virtuals: true });
debtRecordSchema.set("toObject", { virtuals: true });

export default mongoose.model("DebtRecord", debtRecordSchema);
