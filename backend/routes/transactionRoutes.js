import express from "express";
import { getTransactions } from "../controllers/transactionController.js";
import { protect, storeOwnerOnly } from "../middleware/auth.js";
import requireStorage from "../middleware/requireStorage.js";

const router = express.Router();

router.use(protect, storeOwnerOnly, requireStorage);

router.get("/", getTransactions);

export default router;
