import { prisma } from "src/helpers.ts/prisma.js";
const createReview = async (payload) => {
    const result = await prisma.review.create({
        data: payload,
    });
    return result;
};
const getAllReviews = async () => {
    const result = await prisma.review.findMany({
        include: {
            user: true,
            booking: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return result;
};
const getReviewById = async (id) => {
    const result = await prisma.review.findUniqueOrThrow({
        where: { id },
        include: {
            user: true,
            booking: true,
        },
    });
    return result;
};
const updateReview = async (id, payload) => {
    const result = await prisma.review.update({
        where: { id },
        data: payload,
    });
    return result;
};
const deleteReview = async (id) => {
    const result = await prisma.review.delete({
        where: { id },
    });
    return result;
};
const getReviewsByWorkshopId = async (workshopId) => {
    const result = await prisma.review.findMany({
        where: {
            booking: {
                workshopId,
            },
        },
        include: {
            user: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return result;
};
const getReviewsByUserId = async (userId) => {
    const result = await prisma.review.findMany({
        where: {
            userId,
        },
        include: {
            booking: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return result;
};
export const ReviewService = {
    createReview,
    getAllReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getReviewsByWorkshopId,
    getReviewsByUserId,
};
