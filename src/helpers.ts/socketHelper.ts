import colors from "colors";
import { Server, Socket } from "socket.io";
import { prisma } from "./prisma.js";
import { Prisma } from "@prisma/client";
import { ChatService } from "../app/modules/chat/chat.service.js";


let io: Server | null = null;

// Store multiple sockets per user/workshop
const socketMap: Map<string, Set<string>> = new Map();

export const initSocket = (server: any) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: "*" },
  });

  io.on("connection", (socket: Socket) => {
    console.log(colors.green("A user connected"));

    socket.on("register", (id: string) => {
      if (!socketMap.has(id)) socketMap.set(id, new Set());
      socketMap.get(id)!.add(socket.id);
      console.log(colors.blue(`Registered socket ${socket.id} for ID ${id}`));
    });

    socket.on("disconnect", () => {
      console.log(colors.red(`Socket disconnected: ${socket.id}`));
      for (const [id, sockets] of socketMap.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) socketMap.delete(id);
        }
      }
    });

    // Chat Events
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(colors.blue(`Socket ${socket.id} joined room ${roomId}`));
    });

    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(colors.gray(`Socket ${socket.id} left room ${roomId}`));
    });

    socket.on("send_message", async (data: { roomId: string, senderId: string, content: string, type?:any }) => {
      try {
        const message = await ChatService.saveMessage(data);
        
        // Broadcast to everyone in the room
        io!.to(data.roomId).emit("receive_message", message);
        
        // Broadcast notification to users to update their room lists if they are online
        const room = await ChatService.getRoomById(data.roomId);
        if (room) {
          const receiverId = room.userId === data.senderId ? room.workshopId : room.userId;
          
          // Create and emit chat notification
          await createAndEmitChatNotification({
            chatRoomId: data.roomId,
            messageId: message.id,
            triggeredById: data.senderId,
            title: "New Message",
            body: data.content,
            receiverId: receiverId,
            message: message // Pass message for socket payload consistency
          });
        }

      } catch (error) {
        console.error("Error saving message", error);
      }
    });

    socket.on("create_room", async (data: { workshopId: string, userId: string, bookingId?: string, name?: string }) => {
      try {
        const room = await ChatService.createRoom(data);
        socket.join(room.id);
        socket.emit("room_created", room);
        console.log(colors.blue(`Room created/retrieved: ${room.id} for user ${data.userId} and workshop ${data.workshopId}`));
      } catch (error) {
        console.error("Error creating room", error);
        socket.emit("error", { message: "Failed to create room" });
      }
    });

    socket.on("typing", (data: { roomId: string, senderId: string, isTyping: boolean }) => {
      socket.to(data.roomId).emit("user_typing", data);
    });

  });

  return io;
};

export const createRoom = async (data: { workshopId: string, userId: string, bookingId?: string, name?: string }) => {
  return await ChatService.createRoom(data);
};


export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export const getSocketIds = (id: string) => {
  return Array.from(socketMap.get(id) || []);
};

// ---------------- Fixed createAndEmitNotification ----------------
export interface NotificationData extends Prisma.NotificationCreateInput {
  workshopIds?: string[];
  userId?: string;
}

export const createAndEmitNotification = async (data: NotificationData) => {
  // Map our custom type to Prisma's NotificationCreateInput
  const prismaData: Prisma.NotificationCreateInput = {
    title: data.title,
    body: data.body,
    isRead: data.isRead,
    receiverUserId: data.receiverUserId,
    receiverWorkshopId: data.receiverWorkshopId,
    triggeredById: data.triggeredById,
    jobId: data.jobId,
    bookingId: data.bookingId,
    invoiceId: data.invoiceId,
    eventType: data.eventType,
  };

  // 1️⃣ Create notification in database
  const notification = await prisma.notification.create({
    data: prismaData,
  });

  const io = getIO();

  // 2️⃣ Collect all target IDs for emission
  const workshopTargets = new Set<string>();
  if (data.workshopIds) data.workshopIds.forEach(id => workshopTargets.add(id));
  if (data.receiverWorkshopId) workshopTargets.add(data.receiverWorkshopId);

  const userTargets = new Set<string>();
  if (data.userId) userTargets.add(data.userId);
  if (data.receiverUserId) userTargets.add(data.receiverUserId);

  // 3️⃣ Emit to workshop sockets
  workshopTargets.forEach((workshopId) => {
    const socketIds = getSocketIds(workshopId);
    socketIds.forEach((socketId) => {
      io.to(socketId).emit("notification", notification);
    });
  });

  // 4️⃣ Emit to user sockets
  userTargets.forEach((userId) => {
    const socketIds = getSocketIds(userId);
    socketIds.forEach((socketId) => {
      io.to(socketId).emit("notification", notification);
    });
  });

  return notification;
};

// ---------------- Chat Notification Helper ----------------
export interface ChatNotificationData extends Prisma.ChatNotificationCreateInput {
  receiverId: string; // Required for socket emission
  message?: any; // Optional full message object for socket payload
}

export const createAndEmitChatNotification = async (data: ChatNotificationData) => {
  const { receiverId, message, ...prismaPayload } = data;

  // 1️⃣ Create chat notification in database
  const notification = await prisma.chatNotification.create({
    data: prismaPayload,
  });

  const io = getIO();

  // 2️⃣ Emit to receiver sockets
  const socketIds = getSocketIds(receiverId);
  socketIds.forEach((socketId) => {
    io.to(socketId).emit("chat_notification", notification);
    
    // Maintain backward compatibility for room list updates
    io.to(socketId).emit("new_message_notification", {
      roomId: notification.chatRoomId,
      message: message || { id: notification.messageId, content: notification.body },
      notification,
    });
  });

  return notification;
};
