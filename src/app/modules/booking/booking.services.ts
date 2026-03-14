import { Prisma } from "@prisma/client";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { prisma } from "src/helpers.ts/prisma.js";
import { IPaginationOptions } from "src/types/pagination.js";

const createBookings = async (payload: Prisma.BookingCreateInput) => {
  const result = await prisma.booking.create({ data: { ...payload } });
  return result;
};
const getAllBookings = async (
  filter: { searchTerm?: string },
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const andConditions: Prisma.BookingWhereInput[] = [];

  if (filter.searchTerm) {
    andConditions.push({
      OR: ["title", "subTitle"].map((field) => ({
        [field]: {
          contains: filter.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.BookingWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.booking.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      job: true,
      offer: true,
      review: true,
    },
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.booking.count({
    where: whereConditions,
  });

  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: result,
  };
};
const getBookingsById = async (id: string) => {
  const result = await prisma.booking.findUniqueOrThrow({ where: { id }, include: { job: true, offer: true, review: true, workshop: true , user:true} });
  return result;
};

const getReviewByBookingId = async (bookingId: string) => {
  const result = await prisma.review.findUnique({
    where: {
      bookingId,
    },
    include: {
      user: true,
      booking: true,
    },
  });

  return result;
};
const updateBooking = async (
  id: string,
  payload: Prisma.BookingUpdateInput,
) => {
  const result = await prisma.booking.update({ where: { id }, data: payload });
  return result;
};
const deleteBooking = async (id: string) => {
  const result = await prisma.booking.delete({ where: { id } });
  return result;
};

// delete the room when call this api
const completeBooking = async (id: string) => {
  const result = await prisma.booking.update({
    where: { id },
    data: { status: "COMPLETED" },
  });
  await prisma.room.delete({
    where: { bookingId: id },
  });
  return result;
};

const getRoomByBookingId = async (bookingId: string) => {
  const result = await prisma.room.findUnique({
    where: { bookingId },
  });
  return result;
};

export const BookingService = {
  createBookings,
  getAllBookings,
  getBookingsById,
  getReviewByBookingId,
  updateBooking,
  deleteBooking,
  completeBooking,
  getRoomByBookingId,
};
