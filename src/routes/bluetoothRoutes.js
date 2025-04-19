import express from "express";
import { pairDevice } from "../controllers/bluetoothPairingController.js";

const router = express.Router();

// Route for pairing a device via Bluetooth
router.post("/pair", pairDevice);

export default router; 