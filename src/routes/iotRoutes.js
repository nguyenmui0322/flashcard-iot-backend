import express from "express";
import { getFlashcardsForIoT } from "../controllers/iotController.js";
import iotAuthMiddleware from "../middleware/iotAuthMiddleware.js";

const router = express.Router();

router.use(iotAuthMiddleware);

router.get("/flashcards", getFlashcardsForIoT);

export default router;
