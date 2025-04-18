import express from "express";
import { updateWord, deleteWord } from "../controllers/wordController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyFirebaseToken);

router.put("/:id", updateWord);
router.delete("/:id", deleteWord);

export default router;
