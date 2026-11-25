import { getBoardData } from "../services/board.service.js";

export const getBoard = async (_req, res, next) => {
    try {
        const board = await getBoardData();
        return res.status(200).json(board);
    } catch (error) {
        return next(error);
    }
};
