import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import { BookingService } from "./booking.services.js";
import sendResponse from "src/app/shared/sendResponse.js";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await BookingService.createBookings(payload);

  sendResponse(res, {
    success: true,
    message: "Booking created successfully",
    statusCode: 201,
    data: result,
  });
});

export const BookingController = { createBooking };
