import express from "express";
import { streamBoardEvents } from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", streamBoardEvents);

export default router;
