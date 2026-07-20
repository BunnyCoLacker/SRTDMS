import DebtRecord from "../models/DebtRecord.js";
import Borrower from "../models/Borrower.js";
import Transaction from "../models/Transaction.js";

const DEFAULT_DUE_DAYS = 30;

// GET /api/debts?borrowerId=...
export const getDebts = async (req, res) => {
  const { borrowerId } = req.query;
  const filter = { storage: req.storage._id };
  if (borrowerId) filter.borrower = borrowerId;

  const debts = await DebtRecord.find(filter)
    .populate("borrower", "name status")
    .sort({ createdAt: -1 });

  // refresh overdue status on read (in case due date passed since last save)
  const updated = await Promise.all(
    debts.map(async (d) => {
      const balance = d.totalAmount - d.amountPaid;
      const shouldBeOverdue = balance > 0 && new Date() > d.dueDate;
      if (shouldBeOverdue && d.status !== "overdue") {
        d.status = "overdue";
        await d.save();
      }
      return d;
    }),
  );

  res.json(updated);
};

// GET /api/debts/overdue
export const getOverdueDebts = async (req, res) => {
  const debts = await DebtRecord.find({
    storage: req.storage._id,
    status: { $ne: "paid" },
    dueDate: { $lt: new Date() },
  })
    .populate("borrower", "name contactNumber")
    .sort({ dueDate: 1 });

  res.json(debts);
};

// POST /api/debts
export const createDebt = async (req, res) => {
  try {
    const {
      borrowerId,
      productName,
      category,
      bottleType,
      bottleReturned,
      quantity,
      unitPrice,
      dateBorrowed,
      dueInDays,
    } = req.body;

    if (!borrowerId || !productName || !quantity || unitPrice === undefined) {
      return res.status(400).json({
        message: "borrowerId, productName, quantity and unitPrice are required",
      });
    }

    const normalizedCategory =
      String(category || "").toLowerCase() === "beverages"
        ? "Beverages"
        : "Others";
    const normalizedBottleType =
      normalizedCategory === "Beverages" &&
      (bottleType === "with_bottle" || bottleType === "without_bottle")
        ? bottleType
        : null;
    const normalizedBottleReturned =
      normalizedCategory === "Beverages" &&
      normalizedBottleType === "without_bottle"
        ? Boolean(bottleReturned)
        : false;

    if (normalizedCategory === "Beverages" && !normalizedBottleType) {
      return res
        .status(400)
        .json({ message: "Please choose a bottle option for beverage debts" });
    }

    const borrower = await Borrower.findOne({
      _id: borrowerId,
      storage: req.storage._id,
    });
    if (!borrower || borrower.status !== "active") {
      return res.status(404).json({ message: "Active borrower not found" });
    }

    const borrowedDate = dateBorrowed ? new Date(dateBorrowed) : new Date();
    const dueDate = new Date(borrowedDate);
    dueDate.setDate(
      dueDate.getDate() + (Number(dueInDays) || DEFAULT_DUE_DAYS),
    );

    const totalAmount = Number(quantity) * Number(unitPrice);

    const debt = await DebtRecord.create({
      borrower: borrower._id,
      storage: req.storage._id,
      productName,
      category: normalizedCategory,
      bottleType: normalizedBottleType,
      bottleReturned: normalizedBottleReturned,
      quantity,
      unitPrice,
      totalAmount,
      dateBorrowed: borrowedDate,
      dueDate,
      createdBy: req.user._id,
    });

    const bottleDetail =
      normalizedCategory === "Beverages"
        ? ` (${normalizedBottleType === "without_bottle" ? "without bottle" : "with bottle"}${normalizedBottleReturned ? ", bottle returned" : ""})`
        : "";

    await Transaction.create({
      storage: req.storage._id,
      borrower: borrower._id,
      debtRecord: debt._id,
      type: "debt_created",
      amount: totalAmount,
      description: `${quantity} x ${productName}${bottleDetail} added for ${borrower.name}`,
      performedBy: req.user._id,
    });

    res.status(201).json(debt);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create debt record", error: err.message });
  }
};

// PUT /api/debts/:id/pay  { amount }  -- full payment if amount >= balance, else partial deduction
export const payDebt = async (req, res) => {
  try {
    const { amount } = req.body;
    const payAmount = Number(amount);

    if (!payAmount || payAmount <= 0) {
      return res
        .status(400)
        .json({ message: "A valid payment amount is required" });
    }

    const debt = await DebtRecord.findOne({
      _id: req.params.id,
      storage: req.storage._id,
    });
    if (!debt)
      return res.status(404).json({ message: "Debt record not found" });

    const balance = debt.totalAmount - debt.amountPaid;
    if (balance <= 0)
      return res
        .status(400)
        .json({ message: "This debt is already fully paid" });

    const appliedAmount = Math.min(payAmount, balance);
    debt.amountPaid += appliedAmount;
    debt.payments.push({ amount: appliedAmount });
    await debt.save();

    const borrower = await Borrower.findById(debt.borrower);

    await Transaction.create({
      storage: req.storage._id,
      borrower: debt.borrower,
      debtRecord: debt._id,
      type: "payment",
      amount: appliedAmount,
      description: `Payment of ₱${appliedAmount.toFixed(2)} received from ${borrower?.name || "borrower"} for ${debt.productName}${
        debt.status === "paid" ? " (fully paid)" : " (partial payment)"
      }`,
      performedBy: req.user._id,
    });

    res.json(debt);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to process payment", error: err.message });
  }
};

export const payAllDebts = async (req, res) => {
  try {
    const { borrowerId } = req.body;
    if (!borrowerId) {
      return res.status(400).json({ message: "borrowerId is required" });
    }

    const borrower = await Borrower.findOne({
      _id: borrowerId,
      storage: req.storage._id,
    });
    if (!borrower || borrower.status !== "active") {
      return res.status(404).json({ message: "Active borrower not found" });
    }

    const debts = await DebtRecord.find({
      borrower: borrower._id,
      storage: req.storage._id,
      status: { $ne: "paid" },
    });

    if (!debts.length) {
      return res
        .status(400)
        .json({ message: "There is no outstanding debt to pay" });
    }

    let totalPaid = 0;
    await Promise.all(
      debts.map(async (debt) => {
        const balance = debt.totalAmount - debt.amountPaid;
        if (balance > 0) {
          totalPaid += balance;
          debt.amountPaid = debt.totalAmount;
          debt.payments.push({ amount: balance });
          await debt.save();
        }
      }),
    );

    await Transaction.create({
      storage: req.storage._id,
      borrower: borrower._id,
      type: "bulk_payment",
      amount: totalPaid,
      description: `Full payment of ₱${totalPaid.toFixed(2)} received from ${borrower.name} for all debts`,
      performedBy: req.user._id,
    });

    res.json({ message: "All debts marked paid", totalPaid });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to pay all debts", error: err.message });
  }
};

export const markBottleReturned = async (req, res) => {
  try {
    const debt = await DebtRecord.findOne({
      _id: req.params.id,
      storage: req.storage._id,
    });
    if (!debt) {
      return res.status(404).json({ message: "Debt record not found" });
    }

    if (debt.category !== "Beverages" || debt.bottleType !== "without_bottle") {
      return res.status(400).json({
        message:
          "Returned bottle status only applies to beverages recorded without a bottle",
      });
    }

    if (debt.bottleReturned) {
      return res
        .status(400)
        .json({ message: "Returned bottle cannot be undone" });
    }

    debt.bottleReturned = true;
    await debt.save();

    const borrower = await Borrower.findById(debt.borrower);
    await Transaction.create({
      storage: req.storage._id,
      borrower: debt.borrower,
      debtRecord: debt._id,
      type: "bottle_returned",
      amount: 0,
      description: `Bottle return recorded for ${debt.productName} from ${borrower?.name || "borrower"}`,
      performedBy: req.user._id,
    });

    res.json(debt);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to mark bottle returned", error: err.message });
  }
};

// DELETE /api/debts/:id  (cancel/remove an entry, e.g. added by mistake)
export const deleteDebt = async (req, res) => {
  const debt = await DebtRecord.findOneAndDelete({
    _id: req.params.id,
    storage: req.storage._id,
  });
  if (!debt) return res.status(404).json({ message: "Debt record not found" });

  await Transaction.create({
    storage: req.storage._id,
    borrower: debt.borrower,
    debtRecord: debt._id,
    type: "debt_cancelled",
    amount: debt.totalAmount,
    description: `Debt entry for ${debt.productName} was cancelled`,
    performedBy: req.user._id,
  });

  res.json({ message: "Debt record cancelled" });
};
