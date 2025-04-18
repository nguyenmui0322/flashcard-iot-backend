import express from "express";
import {
  getWordGroups,
  createWordGroup,
  getWordGroupById,
  updateWordGroup,
  deleteWordGroup,
  getWordsInGroup,
  addWordToGroup,
  setCurrentWord,
} from "../controllers/wordGroupController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyFirebaseToken);

// Word group routes
router.get("/", getWordGroups);
router.post("/", createWordGroup);
router.get("/:id", getWordGroupById);
router.put("/:id", updateWordGroup);
router.delete("/:id", deleteWordGroup);
router.get("/:id/words", getWordsInGroup);
router.post("/:id/words", addWordToGroup);

// Set current word route
router.post("/set-current-word", setCurrentWord);

export default router;
