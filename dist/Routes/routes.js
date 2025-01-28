"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../Modules/User/user.routes");
const auth_routes_1 = require("../Modules/Auth/auth.routes");
const message_routes_1 = require("../Modules/Message/message.routes");
const router = express_1.default.Router();
const moduleRoute = [
    {
        path: "/users",
        element: user_routes_1.userRoutes,
    },
    {
        path: "/auth",
        element: auth_routes_1.authRoutes,
    },
    {
        path: "/message",
        element: message_routes_1.messageRoute,
    },
];
moduleRoute.forEach((route) => router.use(route.path, route.element));
exports.default = router;
