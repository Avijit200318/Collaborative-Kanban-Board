import { validationResult } from "express-validator";
import { errorHandler } from "../middlewares/error.js";
import { createTask, updateTask, deleteTask } from "../services/task.service.js";

export const createTaskController = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, errors.array()[0].msg));
    }

    try {
        const task = await createTask(req.body);
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
        const result = await updateTask(req.params.id, req.body);
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
        const result = await deleteTask(req.params.id);
        return res.status(200).json({
            message: "Task deleted successfully",
            ...result,
        });
    } catch (error) {
        return next(error);
    }
};
