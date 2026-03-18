import { MessageType } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../helpers.ts/prisma.js";
import ApiError from "../../../errors/ApiError.js";

const createRoom = async (
  payload: {
    bookingId: string;
    userId: string;
    workshopId: string;
    name?: string;
  },
  tx?: any,
) => {
  const client = tx || prisma;
  // Check if room already exists for this booking
  const existingRoom = await client.room.findUnique({
    where: { bookingId: payload.bookingId },
  });

  if (existingRoom) {
    return existingRoom;
  }

  const result = await client.room.create({
    data: payload,
  });

  return result;
};

const getRoomById = async (id: string) => {
  const result = await prisma.room.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      workshop: { select: { id: true, workshopName: true, avatar: true } },
      booking: true,
      lastMessage: {
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });

  return result;
};

const getUserRooms = async (userId: string) => {
  const rooms = await prisma.room.findMany({
    where: { userId },
    include: {
      workshop: {
        select: { id: true, workshopName: true, email: true, avatar: true },
      },
      user: { select: { id: true, name: true, email: true, avatar: true } },
      lastMessage: {
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  const roomsWithUnreadCount = await Promise.all(
    rooms.map(async (room) => {
      const unreadCount = await prisma.message.count({
        where: {
          roomId: room.id,
          senderId: { not: userId },
          isRead: false,
        },
      });
      return { ...room, unreadCount };
    }),
  );

  return roomsWithUnreadCount;
};

const getWorkshopRooms = async (workshopId: string) => {
  const rooms = await prisma.room.findMany({
    where: { workshopId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      lastMessage: {
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  const roomsWithUnreadCount = await Promise.all(
    rooms.map(async (room) => {
      const unreadCount = await prisma.message.count({
        where: {
          roomId: room.id,
          senderId: { not: workshopId },
          isRead: false,
        },
      });
      return { ...room, unreadCount };
    }),
  );

  return roomsWithUnreadCount;
};

const getRoomMessages = async (roomId: string) => {
  const result = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  return result;
};

const saveMessage = async (payload: {
  roomId: string;
  senderId: string;
  content: string;
  type?: MessageType;
}) => {
  const room = await prisma.room.findUnique({
    where: { id: payload.roomId },
  });

  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Room not found");
  }

  // Create message and update room's last message in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        roomId: payload.roomId,
        senderId: payload.senderId,
        content: payload.content,
        type: payload.type || MessageType.TEXT,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    await tx.room.update({
      where: { id: payload.roomId },
      data: {
        lastMessageId: msg.id,
        lastMessageAt: msg.createdAt,
      },
    });

    return msg;
  });

  return result;
};

const markMessagesAsRead = async (roomId: string, senderId: string) => {
  // Mark all messages in room sent by OTHERS as read
  const result = await prisma.message.updateMany({
    where: {
      roomId,
      senderId: { not: senderId },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return result;
};

export const ChatService = {
  createRoom,
  getRoomById,
  getUserRooms,
  getWorkshopRooms,
  getRoomMessages,
  saveMessage,
  markMessagesAsRead,
};
