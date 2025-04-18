import express from "express";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { getProgress } from "../controllers/progressController.js";

const router = express.Router();

router.use(verifyFirebaseToken);

router.get("/", getProgress);

export default router;
