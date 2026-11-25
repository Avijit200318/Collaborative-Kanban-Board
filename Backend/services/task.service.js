import taskModel from "../models/task.model.js";
import { errorHandler } from "../middlewares/error.js";

const reindexColumn = async (status, orderedIds) => {
    if (orderedIds.length === 0) return;

    const operations = orderedIds.map((taskId, index) => ({
        updateOne: {
            filter: { _id: taskId },
            update: { $set: { status, position: index } },
        },
    }));

    await taskModel.bulkWrite(operations);
};

export const createTask = async ({ title, description, priority, assignee, status }) => {
    if (!title || !title.trim()) {
        throw errorHandler(400, "Title is required");
    }

    const targetStatus = status || "Backlog";
    const lastTask = await taskModel
        .findOne({ status: targetStatus })
        .sort({ position: -1 });

    const nextPosition = lastTask ? lastTask.position + 1 : 0;

    const task = await taskModel.create({
        title: title.trim(),
        description: description ?? "",
        priority: priority || "medium",
        assignee: assignee ?? "",
        status: targetStatus,
        position: nextPosition,
    });

    return task.toJSON();
};

export const updateTask = async (id, updates) => {
    const existingTask = await taskModel.findById(id);
    if (!existingTask) {
        throw errorHandler(404, "Task not found");
    }

    const { title, description, priority, assignee, status, position } = updates;
    const oldStatus = existingTask.status;
    const targetStatus = status !== undefined ? status : oldStatus;
    const isMovingOrReordering = status !== undefined || position !== undefined;

    if (title !== undefined) existingTask.title = title.trim();
    if (description !== undefined) existingTask.description = description;
    if (priority !== undefined) existingTask.priority = priority;
    if (assignee !== undefined) existingTask.assignee = assignee;

    if (isMovingOrReordering) {
        if (targetStatus === oldStatus) {
            const siblings = await taskModel
                .find({ status: oldStatus, _id: { $ne: existingTask._id } })
                .sort({ position: 1, updatedAt: 1 });

            const clampedPos = Math.max(
                0,
                Math.min(
                    position !== undefined ? position : existingTask.position,
                    siblings.length
                )
            );

            const orderedIds = siblings.map((t) => t._id);
            orderedIds.splice(clampedPos, 0, existingTask._id);

            await reindexColumn(oldStatus, orderedIds);
            existingTask.status = oldStatus;
            existingTask.position = clampedPos;
        } else {
            const oldColumnSiblings = await taskModel
                .find({ status: oldStatus, _id: { $ne: existingTask._id } })
                .sort({ position: 1, updatedAt: 1 });

            await reindexColumn(
                oldStatus,
                oldColumnSiblings.map((t) => t._id)
            );

            const targetColumnTasks = await taskModel
                .find({ status: targetStatus, _id: { $ne: existingTask._id } })
                .sort({ position: 1, updatedAt: 1 });

            const clampedPos = Math.max(
                0,
                Math.min(
                    position !== undefined ? position : targetColumnTasks.length,
                    targetColumnTasks.length
                )
            );

            const targetOrderedIds = targetColumnTasks.map((t) => t._id);
            targetOrderedIds.splice(clampedPos, 0, existingTask._id);

            await reindexColumn(targetStatus, targetOrderedIds);
            existingTask.status = targetStatus;
            existingTask.position = clampedPos;
        }
    }

    await existingTask.save();

    const allTasks = await taskModel.find({}).sort({ position: 1, updatedAt: -1 });
    return {
        task: existingTask.toJSON(),
        tasks: allTasks.map((t) => t.toJSON()),
    };
};

export const deleteTask = async (id) => {
    const deletedTask = await taskModel.findByIdAndDelete(id);
    if (!deletedTask) {
        throw errorHandler(404, "Task not found");
    }

    const remainingInColumn = await taskModel
        .find({ status: deletedTask.status })
        .sort({ position: 1, updatedAt: 1 });

    await reindexColumn(
        deletedTask.status,
        remainingInColumn.map((t) => t._id)
    );

    const allTasks = await taskModel.find({}).sort({ position: 1, updatedAt: -1 });
    return {
        id: deletedTask._id.toString(),
        tasks: allTasks.map((t) => t.toJSON()),
    };
};
