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
exports.authService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Prisma_1 = __importDefault(require("../../App/Common/Prisma"));
const ApiError_1 = __importDefault(require("../../App/Error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const createToken_1 = require("../../App/Common/createToken");
const config_1 = __importDefault(require("../../App/config"));
const veriflyToken_1 = require("../../Utilities/veriflyToken");
const generateToken04_1 = require("../../Utilities/generateToken04");
const userRegisterIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashPassword = yield bcrypt_1.default.hash(payload.password, 12);
    const userData = {
        name: payload.name,
        email: payload.email,
        password: hashPassword,
        profile: payload.profile,
    };
    const result = yield Prisma_1.default.user.create({
        data: userData,
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
    console.log("Res", result);
    return result;
});
const userLoginFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User Not Found !");
    }
    const isCorrectPassword = yield bcrypt_1.default.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new Error("Incorrect password");
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
    };
    const accessToken = (0, createToken_1.createToken)(jwtPayload, config_1.default.accessToken, config_1.default.accessTokenExpireDate);
    const refreshToken = (0, createToken_1.createToken)(jwtPayload, config_1.default.refreshToken, config_1.default.refreshTokenExpireDate);
    return {
        accessToken,
        refreshToken,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let decodedData;
    try {
        decodedData = (0, veriflyToken_1.verifyToken)(token, config_1.default.refreshToken);
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Your are not authorized !");
    }
    const userData = yield Prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!userData) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User Data Not Found !");
    }
    const jwtPayload = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
    };
    const accessToken = (0, createToken_1.createToken)(jwtPayload, config_1.default.accessToken, config_1.default.accessTokenExpireDate);
    return {
        accessToken,
    };
});
const changePassword = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log({ user, payload });
    const userData = yield Prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!userData) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User Data Not Found !");
    }
    const isCorrectPassword = yield bcrypt_1.default.compare(payload.oldPassword, userData.password);
    if (!isCorrectPassword) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Password doesn't match !");
    }
    const hashPassword = yield bcrypt_1.default.hash(payload.newPassword, 12);
    yield Prisma_1.default.user.update({
        where: {
            email: userData.email,
        },
        data: {
            password: hashPassword,
            needPasswordChange: false,
        },
    });
    return {
        message: "Password Change Successfully ",
    };
});
const generateZegoToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const appId = parseInt(process.env.ZEGO_APP_ID || "0");
    const serverSecret = process.env.ZEGO_SERVER_ID;
    console.log(serverSecret === null || serverSecret === void 0 ? void 0 : serverSecret.length);
    const effectiveTime = 3600;
    const payload = "";
    const token = (0, generateToken04_1.generateToken04)(appId, userId, serverSecret, effectiveTime, payload);
    return token;
});
exports.authService = {
    userRegisterIntoDB,
    userLoginFromDB,
    refreshToken,
    changePassword,
    generateZegoToken,
};
