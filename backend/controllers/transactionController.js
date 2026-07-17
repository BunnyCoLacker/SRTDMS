import Transaction from "../models/Transaction.js";

// GET /api/transactions
export const getTransactions = async (req, res) => {
  const { borrowerId, type } = req.query;
  const filter = { storage: req.storage._id };
  if (borrowerId) filter.borrower = borrowerId;
  if (type) filter.type = type;

  const transactions = await Transaction.find(filter)
    .populate("borrower", "name")
    .populate("performedBy", "name")
    .populate("debtRecord", "productName quantity")
    .sort({ createdAt: -1 })
    .limit(500);

  res.json(transactions);
};
