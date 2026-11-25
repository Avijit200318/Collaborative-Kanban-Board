import { validationResult } from "express-validator";
import { errorHandler } from "../middlewares/error.js";
import { createTask, updateTask, deleteTask } from "../services/task.service.js";
import { broadcastBoardEvent } from "../services/event.service.js";

export const createTaskController = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, errors.array()[0].msg));
    }

    try {
        const sourceClientId = req.headers["x-client-id"] || null;
        const task = await createTask(req.body);
        broadcastBoardEvent("task:created", { task }, sourceClientId);
        return res.status(201).json({ task });
    } catch (error) {
        return next(error);
    }
};

export const updateTaskController = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, errors.array()[0].msg));
    }

    try {
        const sourceClientId = req.headers["x-client-id"] || null;
        const result = await updateTask(req.params.id, req.body);
        broadcastBoardEvent(
            "task:updated",
            { task: result.task, tasks: result.tasks },
            sourceClientId
        );
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

export const deleteTaskController = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, errors.array()[0].msg));
    }

    try {
        const sourceClientId = req.headers["x-client-id"] || null;
        const result = await deleteTask(req.params.id);
        broadcastBoardEvent(
            "task:deleted",
            { id: result.id, tasks: result.tasks },
            sourceClientId
        );
        return res.status(200).json({
            message: "Task deleted successfully",
            ...result,
        });
    } catch (error) {
        return next(error);
    }
};
