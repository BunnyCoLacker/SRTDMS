import express from "express";
import {
  getBorrowers,
  createBorrower,
  updateBorrower,
  cancelBorrower,
  deleteBorrower,
} from "../controllers/borrowerController.js";
import { protect, storeOwnerOnly } from "../middleware/auth.js";
import requireStorage from "../middleware/requireStorage.js";

const router = express.Router();

router.use(protect, storeOwnerOnly, requireStorage);

router.get("/", getBorrowers);
router.post("/", createBorrower);
router.put("/:id", updateBorrower);
router.put("/:id/cancel", cancelBorrower);
router.delete("/:id", deleteBorrower);

export default router;
