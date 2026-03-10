import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/local-business-ordering";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "local-business-ordering",
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error", err);
    process.exit(1);
  }
};

