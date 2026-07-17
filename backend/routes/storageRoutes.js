import express from "express";
import {
  getStorages,
  createStorage,
  updateStorage,
  deleteStorage,
} from "../controllers/storageController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", getStorages);
router.post("/", createStorage);
router.put("/:id", updateStorage);
router.delete("/:id", deleteStorage);

export default router;
