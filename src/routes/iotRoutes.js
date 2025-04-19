import express from "express";
import { getWordGroups, getWordsInGroup, timeoutWordFromIoT, assessWordPronunciation, upload } from "../controllers/iotController.js";
import iotAuthMiddleware from "../middleware/iotAuthMiddleware.js";

const router = express.Router();

router.use(iotAuthMiddleware);

// Get all word groups for the authenticated user
router.get("/word-groups", getWordGroups);

// Get all words in a specific group
router.get("/word-groups/:groupId/words", getWordsInGroup);

// Timeout a word
router.post("/words/:wordId/timeout", timeoutWordFromIoT);

// Assess pronunciation of a word
router.post("/pronunciation/assess", upload.single('audio'), assessWordPronunciation);

export default router;
