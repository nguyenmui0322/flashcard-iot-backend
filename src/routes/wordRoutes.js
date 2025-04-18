import express from "express";
import {
  getWordById,
  updateWord,
  deleteWord,
  timeoutWord,
} from "../controllers/wordController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyFirebaseToken);

// Word routes
router.get("/:id", getWordById);
router.put("/:id", updateWord);
router.delete("/:id", deleteWord);
router.post("/:id/timeout", timeoutWord);

export default router;
