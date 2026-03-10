import { Role } from "@prisma/client";
import express from "express";
import auth from "src/app/middlewares/auth.js";
import { BookingController } from "./booking.controller.js";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { CreateBookingSchema } from "./booking.validation.js";

const router = express.Router();

router.get("/", auth(Role.ADMIN), BookingController.getAllBookings);
router.post(
  "/",
  auth(Role.USER),
  validateRequest(CreateBookingSchema),
  BookingController.createBooking,
);
router.get(
  "/:id",
  auth(Role.ADMIN, Role.USER, Role.WORKSHOP),
  BookingController.getBookingById,
);
router.get(
  "/:id/reviews",
  auth(Role.ADMIN, Role.USER, Role.WORKSHOP),
  BookingController.getReviewByBookingId,
);
// get room by booking id
router.get(
  "/:id/room",
  auth(Role.ADMIN, Role.USER, Role.WORKSHOP),
  BookingController.getRoomByBookingId,
);

router.patch("/:id", auth(Role.WORKSHOP), BookingController.updateBookings);
router.patch("/:id/completed", auth(Role.WORKSHOP), BookingController.completeBooking);
router.delete("/:id", auth(Role.ADMIN), BookingController.deleteBookings);

export const BookingRouter = router;
