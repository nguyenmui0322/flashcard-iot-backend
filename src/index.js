import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import iotRoutes from "./routes/iotRoutes.js";
import wordGroupRoutes from "./routes/wordGroupRoutes.js";
import wordRoutes from "./routes/wordRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import bluetoothRoutes from "./routes/bluetoothRoutes.js";
import { scheduleWordTimeoutCheck } from "./utils/wordTimeoutManager.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/iot", iotRoutes);
app.use("/api/word-groups", wordGroupRoutes);
app.use("/api/words", wordRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/bluetooth", bluetoothRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Flashcard IoT API",
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start the word timeout check mechanism
  // Check every 1 minutes for timed-out words that need to be reactivated
  scheduleWordTimeoutCheck(1);
});
