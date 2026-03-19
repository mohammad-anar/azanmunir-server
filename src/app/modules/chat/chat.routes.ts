import express from "express";
import { Role } from "@prisma/client";
import auth from "src/app/middlewares/auth.js";
import { ChatController } from "./chat.controller.js";

const router = express.Router();

router.post("/", auth(Role.USER, Role.WORKSHOP, Role.ADMIN), ChatController.createRoom);
router.get("/my-rooms", auth(Role.USER, Role.WORKSHOP), ChatController.getMyRooms);
router.get("/booking/:bookingId", auth(Role.USER, Role.WORKSHOP, Role.ADMIN), ChatController.getRoomByBookingId);
router.get("/:id", auth(Role.USER, Role.WORKSHOP, Role.ADMIN), ChatController.getRoomById);


router.get("/:roomId/messages", auth(Role.USER, Role.WORKSHOP, Role.ADMIN), ChatController.getRoomMessages);
router.patch("/:roomId/read", auth(Role.USER, Role.WORKSHOP), ChatController.markMessagesAsRead);

export const ChatRouter = router;
