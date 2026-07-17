import Borrower from "../models/Borrower.js";
import DebtRecord from "../models/DebtRecord.js";
import Transaction from "../models/Transaction.js";

// GET /api/borrowers
export const getBorrowers = async (req, res) => {
  const borrowers = await Borrower.find({ storage: req.storage._id }).sort({ createdAt: -1 });

  // attach a quick balance summary per borrower
  const withBalances = await Promise.all(
    borrowers.map(async (b) => {
      const debts = await DebtRecord.find({ borrower: b._id });
      const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
      const totalPaid = debts.reduce((sum, d) => sum + d.amountPaid, 0);
      const overdueCount = debts.filter((d) => d.status === "overdue").length;
      return {
        ...b.toObject(),
        totalDebt,
        totalPaid,
        balance: totalDebt - totalPaid,
        overdueCount,
      };
    })
  );

  res.json(withBalances);
};

// POST /api/borrowers
export const createBorrower = async (req, res) => {
  try {
    const { name, contactNumber, notes } = req.body;
    if (!name) return res.status(400).json({ message: "Borrower name is required" });

    const borrower = await Borrower.create({
      name,
      contactNumber: contactNumber || "",
      notes: notes || "",
      storage: req.storage._id,
      createdBy: req.user._id,
    });

    res.status(201).json(borrower);
  } catch (err) {
    res.status(500).json({ message: "Failed to create borrower", error: err.message });
  }
};

// PUT /api/borrowers/:id
export const updateBorrower = async (req, res) => {
  const borrower = await Borrower.findOne({ _id: req.params.id, storage: req.storage._id });
  if (!borrower) return res.status(404).json({ message: "Borrower not found" });

  const { name, contactNumber, notes } = req.body;
  if (name) borrower.name = name;
  if (contactNumber !== undefined) borrower.contactNumber = contactNumber;
  if (notes !== undefined) borrower.notes = notes;

  await borrower.save();
  res.json(borrower);
};

// PUT /api/borrowers/:id/cancel
export const cancelBorrower = async (req, res) => {
  const borrower = await Borrower.findOne({ _id: req.params.id, storage: req.storage._id });
  if (!borrower) return res.status(404).json({ message: "Borrower not found" });

  borrower.status = "cancelled";
  await borrower.save();

  await Transaction.create({
    storage: req.storage._id,
    borrower: borrower._id,
    type: "borrower_cancelled",
    description: `Borrower "${borrower.name}" was cancelled`,
    performedBy: req.user._id,
  });

  res.json(borrower);
};

// DELETE /api/borrowers/:id
export const deleteBorrower = async (req, res) => {
  const borrower = await Borrower.findOneAndDelete({ _id: req.params.id, storage: req.storage._id });
  if (!borrower) return res.status(404).json({ message: "Borrower not found" });

  await DebtRecord.deleteMany({ borrower: borrower._id });
  res.json({ message: "Borrower deleted" });
};
