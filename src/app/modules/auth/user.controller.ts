import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import { getSingleFilePath } from "src/app/shared/getFilePath.js";
import config from "src/config/index.js";
import { UserService } from "./user.service.js";
import sendResponse from "src/app/shared/sendResponse.js";
import pick from "src/helpers.ts/pick.js";
import { Prisma } from "@prisma/client";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload: Prisma.UserCreateInput = req.body;
  const image = getSingleFilePath(req.files, "image") as string;
  const url = `http://${config.ip_address}:${config.port}`.concat(image);

  if (image) {
    payload.avatar = url;
  }

  // service will handle hashing of the plain password
  const result = await UserService.createUser(payload);

  sendResponse(res, {
    success: true,
    message: "User registered!",
    statusCode: 201,
    data: result,
  });
});
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["role", "searchTerm"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await UserService.getAllUsers(filters, options);

  sendResponse(res, {
    success: true,
    message: "Users retrieve successfully",
    statusCode: 200,
    data: result,
  });
});
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getUserById(id as string);

  sendResponse(res, {
    success: true,
    message: "User retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

// me ==============
const getMe = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.user;
  const result = await UserService.getMe(email as string);

  sendResponse(res, {
    success: true,
    message: "User data retrieved successfully",
    statusCode: 200,
    data: result,
  });
});
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const image = getSingleFilePath(req.files, "image") as string;
  const url = `http://${config.ip_address}:${config.port}`.concat(image);
  if (image) {
    payload.profilePhoto = url;
  }
  const result = await UserService.updateUser(id, payload);

  sendResponse(res, {
    success: true,
    message: "User updated successfully",
    statusCode: 200,
    data: result,
  });
});
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id as string);

  sendResponse(res, {
    success: true,
    message: "User deleted successfully",
    statusCode: 200,
    data: result,
  });
});
const login = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserService.login(payload);

  sendResponse(res, {
    success: true,
    message: "User logged in successfully",
    statusCode: 200,
    data: result,
  });
});
const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserService.verifyUser(payload);

  sendResponse(res, {
    success: true,
    message: "User verification successfully",
    statusCode: 200,
    data: result,
  });
});
const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await UserService.resendOTP(email);

  sendResponse(res, {
    success: true,
    message: "OTP resent successfully",
    statusCode: 200,
    data: result,
  });
});
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await UserService.forgetPassword(email);

  sendResponse(res, {
    success: true,
    message: "Password reset OTP sent successfully",
    statusCode: 200,
    data: result,
  });
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.user;
  const { password } = req.body;
  const result = await UserService.resetPassword(email, password);

  sendResponse(res, {
    success: true,
    message: "Your password reset successfully",
    statusCode: 200,
    data: result,
  });
});
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.user;
  const { oldPassword, newPassword } = req.body;
  const result = await UserService.changePassword(
    email,
    oldPassword,
    newPassword,
  );

  sendResponse(res, {
    success: true,
    message: "Your password changed successfully",
    statusCode: 200,
    data: result,
  });
});
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.user;
  const result = await UserService.refreshToken(email);

  sendResponse(res, {
    success: true,
    message: "Your refresh token generated successfully",
    statusCode: 200,
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  getMe,
  updateUser,
  deleteUser,
  login,
  verifyUser,
  resendOTP,
  forgetPassword,
  resetPassword,
  changePassword,
  refreshToken,
};
