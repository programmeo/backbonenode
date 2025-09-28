import mongoose from 'mongoose';
import { CONSTANTS } from './constants.js';

/**
 * Connect to MongoDB using Mongoose.
 * Uses Constant.MONGO_URI.
 */
export async function connectDB() {
  const mongoUri = CONSTANTS.MONGODB_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not set. Please add it to your .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
}
