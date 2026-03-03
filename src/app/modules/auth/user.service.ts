import bcrypt from "bcryptjs";
import { Secret, SignOptions } from "jsonwebtoken";
import { emailTemplate } from "src/app/shared/emailTemplate.js";
import { prisma } from "src/helpers.ts/prisma.js";
import config from "src/config/index.js";
import ApiError from "src/errors/ApiError.js";
import { emailHelper } from "src/helpers.ts/emailHelper.js";
import generateOTP from "src/helpers.ts/generateOTP.js";
import { jwtHelper } from "src/helpers.ts/jwtHelper.js";
import redisClient from "src/helpers.ts/redis.js";
import {
  IPaginationOptions,
  IUserFilterRequest,
} from "src/types/pagination.js";
import { ILogin, IUser, IVerifyEmail } from "./user.interface.js";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { Prisma } from "@prisma/client";
import { isMainThread } from "worker_threads";

// create users ================================
const createUser = async (payload: Prisma.UserCreateInput) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_round,
  );
  const result = await prisma.user.create({
    data: { ...payload, password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      isVerified: true,
    },
  });

  //send email
  const otp = generateOTP();

  const redisKey = `otp:${result.email}`;
  await redisClient.set(redisKey, otp, {
    EX: 300,
  });

  const values = {
    name: result.name,
    otp: otp,
    email: result.email!,
  };
  const createAccountTemplate = await emailTemplate.createAccount(values);
  await emailHelper.sendEmail(createAccountTemplate);

  return result;
};
// get all users ===============================================
const getAllUsers = async (
  params: IUserFilterRequest,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];
  if (params.searchTerm) {
    andConditions.push({
      OR: ["name", "email", "phone"].map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  andConditions.push({
    isVerified: true,
  });
  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// get user by id ================================================
const getUserById = async (id: string) => {
  const result = prisma.user.findUniqueOrThrow({ where: { id } });
  return result;
};

// update user =====================================================
const updateUser = async (id: string, payload: Partial<IUser>) => {
  const result = await prisma.user.update({ where: { id }, data: payload });
  return result;
};

// delete user ========================================
const deleteUser = async (id: string) => {
  const result = await prisma.user.delete({ where: { id } });
  return result;
};

// login ===============================================
const login = async (payload: ILogin) => {
  const isExist = await prisma.user.findFirstOrThrow({
    where: { email: payload.email, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      password: true,
      isVerified: true,
      status: true,
    },
  });

  const { password, ...userData } = isExist;

  if (!isExist.isVerified) {
    throw new ApiError(
      403,
      "You are not verifies. Please verify your account to login",
    );
  }

  // check bcrypt password
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    isExist.password,
  );

  if (!isPasswordMatched) {
    throw new ApiError(400, "Invalid password");
  }

  const accessToken = jwtHelper.createToken(
    userData,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as SignOptions["expiresIn"],
  );
  const refreshToken = jwtHelper.createToken(
    userData,
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as SignOptions["expiresIn"],
  );

  return { accessToken, refreshToken, user: userData };
};

// verify==============================================
const verifyUser = async ({ email, otp }: IVerifyEmail) => {
  // 1. Get the user's email from the DB
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      name: true,
      email: true,
      phone: true,
      isVerified: true,
      id: true,
      role: true,
      address: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new Error("User not found");

  const redisKey = `otp:${user.email}`;
  const storedOtp = await redisClient.get(redisKey);

  if (!storedOtp) throw new Error("OTP expired or not found");
  if (storedOtp !== String(otp)) throw new Error("Invalid OTP");

  // 2. Mark user as verified
  await prisma.user.update({
    where: { email },
    data: { isVerified: true },
  });

  // 3. Remove OTP from Redis
  await redisClient.del(redisKey);

  const accessToken = jwtHelper.createToken(
    user,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as SignOptions["expiresIn"],
  );
  const refreshToken = jwtHelper.createToken(
    user,
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as SignOptions["expiresIn"],
  );

  return { accessToken, refreshToken, user };
};

// resendOTP =========================================
const resendOTP = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, isVerified: true },
  });

  if (!user) throw new Error("User not found");
  if (user.isVerified) return { status: "already_verified" };

  // 2. Generate new OTP
  const otp = generateOTP();

  // 3. Store OTP
  const redisKey = `otp:${email}`;
  await redisClient.set(redisKey, otp, { EX: 300 });

  // 4. Prepare email template
  const values = {
    name: user.name,
    otp,
    email: email,
  };
  const otpTemplate = await emailTemplate.createAccount(values);

  // 5. Send OTP email
  await emailHelper.sendEmail(otpTemplate);

  return { status: "Otp resend successfully" };
};

const forgetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      isDeleted: true,
      role: true,
      phone: true,
      address: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new ApiError(404, "User not found");
  if (!user.isVerified || user.isDeleted) {
    throw new ApiError(
      403,
      "You are not verifies. Please verify your account to reset password",
    );
  }

  const token = jwtHelper.createToken(
    user,
    config.jwt.jwt_secret as Secret,
    "15m",
  );
  const forgetPasswordTemplate = await emailTemplate.forgetPassword({
    email,
    token,
  });

  // 5. Send OTP email
  await emailHelper.sendEmail(forgetPasswordTemplate);

  return { status: "Reset password email sent" };
};

// reset password =================================================
const resetPassword = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new ApiError(404, "User not found");

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round),
  );

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return null;
};

// change password =================================================
const changePassword = async (
  email: string,
  newPassword: string,
  oldPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new ApiError(404, "User not found");

  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatched) throw new ApiError(400, "Old password is incorrect");

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_round),
  );

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return null;
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  verifyUser,
  resendOTP,
  forgetPassword,
  resetPassword,
  changePassword,
};
