import { Role } from "@prisma/client";
import express from "express";
import auth from "src/app/middlewares/auth.js";
import { BookingController } from "./booking.controller.js";

const router = express.Router();

router.post("/", auth(Role.USER), BookingController.createBooking);

export const BookingRouter = router;
