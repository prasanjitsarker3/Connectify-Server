import { UserRole, UserStatus } from "@prisma/client";
import { IUser } from "../User/userInterface";
import bcrypt from "bcrypt";
import prisma from "../../App/Common/Prisma";
import { IChangePassword, ILogin } from "./authInterface";
import ApiError from "../../App/Error/ApiError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { createToken } from "../../App/Common/createToken";
import config from "../../App/config";
import { verifyToken } from "../../Utilities/veriflyToken";
import { ITokenUser } from "../../App/Common/authType";
import { generateToken04 } from "../../Utilities/generateToken04";

const userRegisterIntoDB = async (payload: any) => {
  const hashPassword: string = await bcrypt.hash(payload.password, 12);
  const userData = {
    name: payload.name,
    email: payload.email,
    password: hashPassword,
    profile: payload.profile,
  };
  const result = await prisma.user.create({
    data: userData,
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  console.log("Res", result);
  return result;
};

const userLoginFromDB = async (payload: ILogin) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found !");
  }
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isCorrectPassword) {
    throw new Error("Incorrect password");
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
  };

  const accessToken = createToken(
    jwtPayload,
    config.accessToken as string,
    config.accessTokenExpireDate as string
  );
  const refreshToken = createToken(
    jwtPayload,
    config.refreshToken as string,
    config.refreshTokenExpireDate as string
  );
  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token, config.refreshToken as string);
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your are not authorized !");
  }
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Data Not Found !");
  }

  const jwtPayload: JwtPayload = {
    id: userData.id,
    email: userData.email,
    role: userData.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.accessToken as string,
    config.accessTokenExpireDate as string
  );

  return {
    accessToken,
  };
};

const changePassword = async (user: ITokenUser, payload: IChangePassword) => {
  console.log({ user, payload });
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Data Not Found !");
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.NOT_FOUND, "Password doesn't match !");
  }

  const hashPassword: string = await bcrypt.hash(payload.newPassword, 12);
  await prisma.user.update({
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
};

const generateZegoToken = async (userId: string) => {
  const appId = parseInt(process.env.ZEGO_APP_ID || "0");
  const serverSecret = process.env.ZEGO_SERVER_ID as string;
  console.log(serverSecret?.length);
  const effectiveTime = 3600;
  const payload = "";

  const token = generateToken04(
    appId,
    userId,
    serverSecret,
    effectiveTime,
    payload
  );

  return token;
};

export const authService = {
  userRegisterIntoDB,
  userLoginFromDB,
  refreshToken,
  changePassword,
  generateZegoToken,
};
