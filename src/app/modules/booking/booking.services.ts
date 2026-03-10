import { Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";

const createBookings = async (payload: Prisma.BookingCreateInput) => {
  const result = await prisma.booking.create({ data: { ...payload } });
  return result;
};
const getAllBookings = async () => {
  const result = (await prisma.booking.findMany({include:{job:true, room:true, user:true, workshop:true, review:true,  offer:true}}));
  return result;
};
const getBookingsById = async (id: string) => {
  const result = await prisma.booking.findUniqueOrThrow({ where: { id } });
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
