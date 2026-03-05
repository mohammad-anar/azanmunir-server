import { Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";

const createBookings = async (payload: Prisma.BookingCreateInput) => {
  const result = await prisma.booking.create({ data: payload });
  return result;
};
const getAllBookings = async (payload: Prisma.BookingCreateInput) => {
  const result = await prisma.booking.create({ data: payload });
  return result;
};
const getBookingsById = async (payload: Prisma.BookingCreateInput) => {
  const result = await prisma.booking.create({ data: payload });
  return result;
};
const updateBooking = async (payload: Prisma.BookingCreateInput) => {
  const result = await prisma.booking.create({ data: payload });
  return result;
};

export const BookingService = { createBookings, getAllBookings, getBookingsById, updateBooking };
