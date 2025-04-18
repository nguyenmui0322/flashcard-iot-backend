import express from "express";
import {
  getWordGroups,
  createWordGroup,
  getWordGroupById,
  updateWordGroup,
  deleteWordGroup,
  getWordsInGroup,
  addWordToGroup,
} from "../controllers/wordGroupController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyFirebaseToken);

router.get("/", getWordGroups);
router.post("/", createWordGroup);
router.get("/:id", getWordGroupById);
router.put("/:id", updateWordGroup);
router.delete("/:id", deleteWordGroup);
router.get("/:id/words", getWordsInGroup);
router.post("/:id/words", addWordToGroup);

export default router;
