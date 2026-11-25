import {
    addEventClient,
    removeEventClient,
} from "../services/event.service.js";

export const streamBoardEvents = (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
    }

    res.write(`event: connected\ndata: ${JSON.stringify({ status: "connected" })}\n\n`);

    addEventClient(res);

    const heartbeat = setInterval(() => {
        try {
            res.write(": heartbeat\n\n");
        } catch {
            clearInterval(heartbeat);
            removeEventClient(res);
        }
    }, 25000);

    req.on("close", () => {
        clearInterval(heartbeat);
        removeEventClient(res);
    });
};
