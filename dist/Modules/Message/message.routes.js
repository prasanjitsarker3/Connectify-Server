"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoute = void 0;
const express_1 = __importDefault(require("express"));
const messageController_1 = require("./messageController");
const auth_1 = __importDefault(require("../../Middleware/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get("/:id", (0, auth_1.default)(client_1.UserRole.user, client_1.UserRole.admin), messageController_1.messageController.getMessage);
router.post("/send", (0, auth_1.default)(client_1.UserRole.user, client_1.UserRole.admin), messageController_1.messageController.sendMessage);
router.post("/sendimg", (0, auth_1.default)(client_1.UserRole.user, client_1.UserRole.admin), messageController_1.messageController.sendMessageWithImage);
router.get("/contact/:fromId", (0, auth_1.default)(client_1.UserRole.user, client_1.UserRole.admin), messageController_1.messageController.getInitialContactsWithMessage);
exports.messageRoute = router;
