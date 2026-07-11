import mongoose from "mongoose";
import { logger } from "../utils/logger";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/meetsync";
  try {
    await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${uri}`);
  } catch (err) {
    logger.error("MongoDB connection failed", err);
    process.exit(1);
  }
}
