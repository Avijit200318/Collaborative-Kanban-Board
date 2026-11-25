export const errorHandler = (statusCode, message) => {
    const error = new Error();
    error.statusCode = statusCode;
    error.message = message;
    return error;
};

export const simulateFailureMiddleware = (req, _res, next) => {
    const headerRequested = req.headers["x-simulate-error"] === "true";
    const envRate = Number(process.env.SIMULATE_FAILURE_RATE || 0);
    const randomTriggered = envRate > 0 && Math.random() < envRate;

    if (!headerRequested && !randomTriggered) {
        return next();
    }

    setTimeout(() => {
        next(errorHandler(500, "Simulated API failure — changes were rolled back"));
    }, 450);
};
