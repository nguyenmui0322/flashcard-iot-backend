import express from "express";
import { register } from "../controllers/authController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", register);

export default router;
