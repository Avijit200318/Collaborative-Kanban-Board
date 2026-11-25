import taskModel, { VALID_STATUSES } from "../models/task.model.js";

export const getBoardData = async () => {
    const tasks = await taskModel.find({}).sort({ position: 1, updatedAt: -1 });
    return {
        columns: VALID_STATUSES,
        tasks: tasks.map((task) => task.toJSON()),
    };
};
