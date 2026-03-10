import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import { BookingService } from "./booking.services.js";
import sendResponse from "src/app/shared/sendResponse.js";
import ApiError from "src/errors/ApiError.js";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const payload = req.body;

  if (!id) {
    throw new ApiError(404, "User not found!");
  }
  payload.userId = id;

  const result = await BookingService.createBookings(payload);

  sendResponse(res, {
    success: true,
    message: "Booking created successfully",
    statusCode: 201,
    data: result,
  });
});
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getAllBookings();

  sendResponse(res, {
    success: true,
    message: "Bookings retrieved successfully",
    statusCode: 200,
    data: result,
  });
});
const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.getBookingsById(id);

  sendResponse(res, {
    success: true,
    message: "Booking retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

const getReviewByBookingId = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  const result = await BookingService.getReviewByBookingId(bookingId);

  res.status(200).json({
    success: true,
    message: "Review retrieved successfully",
    data: result,
  });
};

const updateBookings = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await BookingService.updateBooking(id, payload);

  sendResponse(res, {
    success: true,
    message: "Bookings updated successfully",
    statusCode: 200,
    data: result,
  });
});
const deleteBookings = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.deleteBooking(id);

  sendResponse(res, {
    success: true,
    message: "Bookings deleted successfully",
    statusCode: 200,
    data: result,
  });
});

const completeBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.completeBooking(id);

  sendResponse(res, {
    success: true,
    message: "Booking completed successfully",
    statusCode: 200,
    data: result,
  });
});

const getRoomByBookingId = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.getRoomByBookingId(id);

  sendResponse(res, {
    success: true,
    message: "Room retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  getBookingById,
  getReviewByBookingId,
  updateBookings,
  deleteBookings,
  completeBooking,
  getRoomByBookingId,
};
