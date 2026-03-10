import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { prisma } from "src/helpers.ts/prisma.js";
import { jwtHelper } from "src/helpers.ts/jwtHelper.js";
import ApiError from "src/errors/ApiError.js";
import bcrypt from "bcryptjs";
import config from "src/config/index.js";
import redisClient from "src/helpers.ts/redis.js";
import generateOTP from "src/helpers.ts/generateOTP.js";
import { emailTemplate } from "src/app/shared/emailTemplate.js";
import { emailHelper } from "src/helpers.ts/emailHelper.js";
// create workshop ================================
const createWorkshop = async (payload) => {
    const hashedPassword = await bcrypt.hash(payload.password, config.bcrypt_salt_round);
    const workshop = await prisma.workshop.create({
        data: {
            ...payload,
            password: hashedPassword,
        },
    });
    return workshop;
};
// get all workshops ===============================================
const getAllWorkshops = async (params, options) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: ["workshopName", "ownerName", "address", "description"].map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma.workshop.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? {
                [options.sortBy]: options.sortOrder,
            }
            : {
                createdAt: "desc",
            },
        select: {
            id: true,
            workshopName: true,
            email: true,
            phone: true,
            address: true,
            description: true,
            avatar: true,
            role: true,
            isVerified: true,
            approvalStatus: true,
            avgRating: true,
            city: true,
            country: true,
            ownerName: true,
            latitude: true,
            longitude: true,
            cvrNumber: true,
            createdAt: true,
            updatedAt: true,
            state: true,
            bookings: true,
            categories: true,
            workshopOpeningHours: true,
            postalCode: true,
            invoices: true,
            jobs: true,
            reviewsCount: true,
            rooms: true,
            _count: true,
        },
    });
    const total = await prisma.workshop.count({
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
const getWorkshopById = async (id) => {
    const result = await prisma.workshop.findUniqueOrThrow({
        where: { id },
        select: {
            id: true,
            workshopName: true,
            email: true,
            phone: true,
            address: true,
            description: true,
            avatar: true,
            role: true,
            isVerified: true,
            approvalStatus: true,
            avgRating: true,
            city: true,
            country: true,
            ownerName: true,
            latitude: true,
            longitude: true,
            cvrNumber: true,
            createdAt: true,
            updatedAt: true,
            state: true,
            bookings: true,
            categories: true,
            workshopOpeningHours: true,
            postalCode: true,
            invoices: true,
            jobs: true,
            reviewsCount: true,
            rooms: true,
            _count: true,
        },
    });
    return result;
};
const getMe = async (email) => {
    const result = await prisma.workshop.findUniqueOrThrow({
        where: { email },
        select: {
            id: true,
            workshopName: true,
            email: true,
            phone: true,
            address: true,
            description: true,
            avatar: true,
            role: true,
            isVerified: true,
            approvalStatus: true,
            avgRating: true,
            city: true,
            country: true,
            ownerName: true,
            latitude: true,
            longitude: true,
            cvrNumber: true,
            createdAt: true,
            updatedAt: true,
            state: true,
            bookings: true,
            categories: true,
            workshopOpeningHours: true,
            postalCode: true,
            invoices: true,
            jobs: true,
            reviewsCount: true,
            rooms: true,
            _count: true,
        },
    });
    return result;
};
const updateWorkshop = async (id, payload) => {
    const result = await prisma.workshop.update({
        where: { id },
        data: payload,
    });
    return result;
};
const deleteWorkshop = async (id) => {
    const result = await prisma.workshop.delete({
        where: { id },
    });
    return result;
};
const loginWorkshop = async (payload) => {
    const isExist = await prisma.workshop.findFirstOrThrow({
        where: {
            email: payload.email,
            // approvalStatus: "APPROVED", // optional check
        },
        select: {
            id: true,
            workshopName: true,
            email: true,
            phone: true,
            password: true,
            isVerified: true,
            role: true,
            approvalStatus: true,
        },
    });
    if (!isExist.isVerified) {
        throw new ApiError(403, "Workshop is not verified. Please verify first.");
    }
    const isPasswordMatched = await bcrypt.compare(payload.password, isExist.password);
    if (!isPasswordMatched) {
        throw new ApiError(400, "Invalid password");
    }
    const { password, ...workshopData } = isExist;
    const accessToken = jwtHelper.createToken(workshopData, config.jwt.jwt_secret, config.jwt.jwt_expire_in);
    const refreshToken = jwtHelper.createToken(workshopData, config.jwt.jwt_secret, config.jwt.jwt_refresh_expire_in);
    return { accessToken, refreshToken, workshop: workshopData };
};
const verifyWorkshop = async ({ email, otp }) => {
    const workshop = await prisma.workshop.findUnique({
        where: { email },
    });
    if (!workshop)
        throw new ApiError(404, "Workshop not found");
    const redisKey = `otp:${email}`;
    const storedOtp = await redisClient.get(redisKey);
    if (!storedOtp)
        throw new ApiError(400, "OTP expired");
    if (storedOtp !== String(otp))
        throw new ApiError(400, "Invalid OTP");
    await prisma.workshop.update({
        where: { email },
        data: { isVerified: true },
    });
    await redisClient.del(redisKey);
    const { password, ...workshopData } = workshop;
    const accessToken = jwtHelper.createToken(workshopData, config.jwt.jwt_secret, config.jwt.jwt_expire_in);
    const refreshToken = jwtHelper.createToken(workshopData, config.jwt.jwt_secret, config.jwt.jwt_refresh_expire_in);
    return { accessToken, refreshToken, workshop: workshopData };
};
const resendWorkshopOTP = async (email) => {
    const workshop = await prisma.workshop.findUnique({
        where: { email },
    });
    if (!workshop)
        throw new ApiError(404, "Workshop not found");
    if (workshop.isVerified)
        return { status: "already_verified" };
    const otp = generateOTP();
    await redisClient.set(`otp:${email}`, otp, { EX: 300 });
    const template = await emailTemplate.createAccount({
        name: workshop.workshopName,
        otp,
        email,
    });
    await emailHelper.sendEmail(template);
    return { status: "OTP resent successfully" };
};
const forgetWorkshopPassword = async (email) => {
    const workshop = await prisma.workshop.findUnique({
        where: { email },
    });
    if (!workshop)
        throw new ApiError(404, "Workshop not found");
    if (!workshop.isVerified)
        throw new ApiError(403, "Workshop not verified");
    const token = jwtHelper.createToken({ id: workshop.id, email: workshop.email }, config.jwt.jwt_secret, "15m");
    const template = await emailTemplate.forgetPassword({
        email,
        token,
    });
    await emailHelper.sendEmail(template);
    return { status: "Reset password email sent" };
};
const resetWorkshopPassword = async (email, password) => {
    const workshop = await prisma.workshop.findUnique({
        where: { email },
    });
    if (!workshop)
        throw new ApiError(404, "Workshop not found");
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_round));
    await prisma.workshop.update({
        where: { email },
        data: { password: hashedPassword },
    });
    return null;
};
const changeWorkshopPassword = async (email, newPassword, oldPassword) => {
    const workshop = await prisma.workshop.findUnique({
        where: { email },
    });
    if (!workshop)
        throw new ApiError(404, "Workshop not found");
    const isPasswordMatched = await bcrypt.compare(oldPassword, workshop.password);
    if (!isPasswordMatched)
        throw new ApiError(400, "Old password incorrect");
    const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_round));
    await prisma.workshop.update({
        where: { email },
        data: { password: hashedPassword },
    });
    return null;
};
const getNearbyJobs = async (workshopId) => {
    const workshop = await prisma.workshop.findUnique({
        where: { id: workshopId },
    });
    if (!workshop?.latitude || !workshop?.longitude) {
        throw new Error("Workshop location not set");
    }
    return prisma.$queryRaw `
    SELECT *
    FROM "Job"
    WHERE status = 'OPEN'
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography,
      ST_SetSRID(ST_MakePoint(${workshop.longitude}, ${workshop.latitude}), 4326)::geography,
      "radius" * 1000
    )
    ORDER BY "createdAt" DESC
  `;
};
const getReviewsByWorkshopId = async (workshopId) => {
    const result = await prisma.review.findMany({
        where: {
            booking: {
                workshopId: workshopId,
            },
        },
        select: {
            booking: {
                select: {
                    review: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return result;
};
const getBookingsByWorkshopId = async (workshopId) => {
    const result = await prisma.booking.findMany({
        where: {
            workshopId: workshopId,
        },
        include: {
            job: true,
            offer: true,
            review: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    phone: true,
                    role: true,
                },
            },
            workshop: {
                select: {
                    id: true,
                    ownerName: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    avgRating: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return result;
};
export const WorkshopService = {
    createWorkshop,
    getAllWorkshops,
    getWorkshopById,
    getMe,
    updateWorkshop,
    deleteWorkshop,
    loginWorkshop,
    verifyWorkshop,
    resendWorkshopOTP,
    forgetWorkshopPassword,
    resetWorkshopPassword,
    changeWorkshopPassword,
    getNearbyJobs,
    getReviewsByWorkshopId,
    getBookingsByWorkshopId,
};
