"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something Went Wrong !";
    let error = err;
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        (message = "Validation Error"), (error = err.message);
    }
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            const errorFind = `${error.meta.modelName} Table Target Fields ${error.meta.target}`;
            (message = errorFind), (error = err.meta);
        }
    }
    res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
        statusCode,
        success,
        message,
        error,
    });
};
exports.default = globalErrorHandler;
