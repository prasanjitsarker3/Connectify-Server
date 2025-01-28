"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = void 0;
const catchAsync_1 = __importDefault(require("../../Utilities/catchAsync"));
const messageService_1 = require("./messageService");
const sendResponse_1 = __importDefault(require("../../Utilities/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const sendMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield messageService_1.messageService.sendNewMessage(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Message Send Successfully",
        data: result,
    });
}));
const sendMessageWithImage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield messageService_1.messageService.sendMessageImage(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Message Send Successfully",
        data: result,
    });
}));
const getMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const from = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield messageService_1.messageService.getMessage(id, from);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Message Successfully",
        data: result,
    });
}));
const getInitialContactsWithMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fromId } = req.params;
    const result = yield messageService_1.messageService.getInitialContactsWithMessage(fromId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Profile Successfully",
        data: result,
    });
}));
exports.messageController = {
    sendMessage,
    getMessage,
    sendMessageWithImage,
    getInitialContactsWithMessage,
};
