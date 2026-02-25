import { prisma } from "src/app/shared/prisma.js";
import { ILogin, IUser, IVerifyEmail } from "./user.interface.js";
import generateOTP from "src/helpers.ts/generateOTP.js";
import { emailTemplate } from "src/app/shared/emailTemplate.js";
import { emailHelper } from "src/helpers.ts/emailHelper.js";
import { jwtHelper } from "src/helpers.ts/jwtHelper.js";
import config from "src/config/index.js";
import { Secret, SignOptions } from "jsonwebtoken";
import ApiError from "src/errors/ApiError.js";
import redisClient from "src/helpers.ts/redis.js";
import bcrypt from "bcryptjs";

// create users ================================
const createUser = async (payload: IUser) => {
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
const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    where: { role: { in: ["USER", "WORKSHOP"] } },
  });
  return result;
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
      isVerified: true,
      status: true,
    },
  });

  if (!isExist.isVerified) {
    throw new ApiError(
      403,
      "You are not verifies. Please verify your account to login",
    );
  }
  const accessToken = jwtHelper.createToken(
    isExist,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as SignOptions["expiresIn"],
  );
  const refreshToken = jwtHelper.createToken(
    isExist,
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as SignOptions["expiresIn"],
  );

  return { accessToken, refreshToken, user: isExist };
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
  if (user.isVerified) return { status: "already_verified" };

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

  return { status: "otp_sent" };
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
};
