import express from "express";
import { updateWord, deleteWord, setWordTimeout, generateWords } from "../controllers/wordController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyFirebaseToken);

router.put("/:id", updateWord);
router.delete("/:id", deleteWord);
router.post("/:wordId/timeout", setWordTimeout);
router.post("/generate", generateWords);

export default router;
