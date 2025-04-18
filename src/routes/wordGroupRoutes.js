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

router.use(verifyFirebaseToken);

router.get("/", getWordGroups);
router.post("/", createWordGroup);
router.get("/:id", getWordGroupById);
router.put("/:id", updateWordGroup);
router.delete("/:id", deleteWordGroup);
router.get("/:id/words", getWordsInGroup);
router.post("/:id/words", addWordToGroup);

router.post("/set-current-word", setCurrentWord);

export default router;
