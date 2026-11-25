import mongoose from "mongoose";

export const VALID_STATUSES = ["Backlog", "Todo", "In Progress", "Done"];
export const VALID_PRIORITIES = ["low", "medium", "high"];

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: [1, "Title is required"],
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        priority: {
            type: String,
            enum: VALID_PRIORITIES,
            default: "medium",
        },
        assignee: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            enum: VALID_STATUSES,
            default: "Backlog",
        },
        position: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = ret._id.toString();
                ret.updatedAt = ret.updatedAt
                    ? new Date(ret.updatedAt).toISOString()
                    : new Date().toISOString();
                delete ret._id;
                delete ret.__v;
                delete ret.createdAt;
                return ret;
            },
        },
    }
);

taskSchema.index({ status: 1, position: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
