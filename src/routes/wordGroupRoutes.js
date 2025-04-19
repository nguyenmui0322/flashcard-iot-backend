import express from "express";
import {
  getWordGroups,
  createWordGroup,
  getWordGroupById,
  updateWordGroup,
  deleteWordGroup,
  getWordsInGroup,
  addWordToGroup,
  generateWordGroup,
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
router.post("/generate", generateWordGroup);

export default router;
