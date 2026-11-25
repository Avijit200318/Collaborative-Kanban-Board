import mongoose from "mongoose";

export const connectToDB = async () => {
    const mongoUri = process.env.MONGO || "mongodb://127.0.0.1:27017/kanban-board";

    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB is connected");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
    }
};
