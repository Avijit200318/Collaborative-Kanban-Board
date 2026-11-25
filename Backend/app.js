import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { connectToDB } from "./db/db.js";
import boardRoutes from "./routes/board.route.js";
import taskRoutes from "./routes/task.route.js";
import eventRoutes from "./routes/event.route.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDB();

const __dirname = path.resolve();

app.use("/api/board", boardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/events", eventRoutes);

app.use(express.static(path.join(__dirname, "/Frontend/dist")));
app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(__dirname, "Frontend", "dist", "index.html"));
});

app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

export default app;
