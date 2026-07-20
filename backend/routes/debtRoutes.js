import express from "express";
import {
  getDebts,
  getOverdueDebts,
  createDebt,
  payDebt,
  deleteDebt,
} from "../controllers/debtController.js";
import { protect, storeOwnerOnly } from "../middleware/auth.js";
import requireStorage from "../middleware/requireStorage.js";

const router = express.Router();

router.use(protect, storeOwnerOnly, requireStorage);

router.get("/", getDebts);
router.get("/overdue", getOverdueDebts);
router.post("/", createDebt);
router.put("/:id/pay", payDebt);
router.put("/:id/return-bottle", markBottleReturned);
router.post("/pay-all", payAllDebts);
router.delete("/:id", deleteDebt);

export default router;
