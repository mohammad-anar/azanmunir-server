import { prisma } from "src/helpers.ts/prisma.js";
const createBookings = async (payload) => {
    const result = await prisma.booking.create({ data: { ...payload } });
    return result;
};
const getAllBookings = async () => {
    const result = await prisma.booking.findMany();
    return result;
};
const getBookingsById = async (id) => {
    const result = await prisma.booking.findUniqueOrThrow({ where: { id } });
    return result;
};

 
const getReviewByBookingId = async (bookingId) => {
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
const updateBooking = async (id, payload) => {
    const result = await prisma.booking.update({ where: { id }, data: payload });
    return result;
};
const deleteBooking = async (id) => {
    const result = await prisma.booking.delete({ where: { id } });
    return result;
};
// other services here
export const BookingService = {
    createBookings,
    getAllBookings,
    getBookingsById,
    getReviewByBookingId,
    updateBooking,
    deleteBooking,
    
};
