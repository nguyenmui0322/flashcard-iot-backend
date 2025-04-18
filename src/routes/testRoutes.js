import express from "express";
import { testFirebaseAuth } from "../controllers/testController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route that requires Firebase authentication
router.get("/firebase-auth", verifyFirebaseToken, testFirebaseAuth);

export default router;
