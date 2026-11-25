import express from "express";
import { body, param } from "express-validator";
import { VALID_PRIORITIES, VALID_STATUSES } from "../models/task.model.js";
import { simulateFailureMiddleware } from "../middlewares/error.js";
import {
    createTaskController,
    updateTaskController,
    deleteTaskController,
} from "../controllers/task.controller.js";

const router = express.Router();

router.use(simulateFailureMiddleware);

router.post(
    "/create",
    [
        body("title").trim().notEmpty().withMessage("Title is required"),
        body("description").optional().isString().withMessage("Description must be a string"),
        body("priority")
            .optional()
            .isIn(VALID_PRIORITIES)
            .withMessage("Priority must be low, medium, or high"),
        body("assignee").optional().isString().withMessage("Assignee must be a string"),
        body("status")
            .optional()
            .isIn(VALID_STATUSES)
            .withMessage("Invalid column status"),
    ],
    createTaskController
);

router.patch(
    "/update/:id",
    [
        param("id").isMongoId().withMessage("Invalid task ID"),
        body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
        body("description").optional().isString().withMessage("Description must be a string"),
        body("priority")
            .optional()
            .isIn(VALID_PRIORITIES)
            .withMessage("Priority must be low, medium, or high"),
        body("assignee").optional().isString().withMessage("Assignee must be a string"),
        body("status")
            .optional()
            .isIn(VALID_STATUSES)
            .withMessage("Invalid column status"),
        body("position")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Position must be a non-negative integer"),
    ],
    updateTaskController
);

router.delete(
    "/delete/:id",
    [param("id").isMongoId().withMessage("Invalid task ID")],
    deleteTaskController
);

export default router;
