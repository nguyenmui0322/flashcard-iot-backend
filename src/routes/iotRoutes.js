import express from "express";
import { getFlashcardsForIoT } from "../controllers/iotController.js";
import iotAuth from "../middleware/iotAuth.js";

const router = express.Router();

router.use(iotAuth);

router.get("/flashcards", getFlashcardsForIoT);

export default router;
