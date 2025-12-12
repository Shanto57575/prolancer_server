/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { AppError } from "../../utils/AppError";
import Freelancer from "../freelancer/freelancer.model";
import { ChatRoom } from "./chat.model";
import pusher from "../../utils/pusher";
import { NotificationService } from "../notification/notification.service";

const createChatRoom = async (
  jobId: string,
  clientId: string,
  freelancerId: string // This is Freelancer Model ID (from Application)
) => {
  // 1. Get Freelancer User ID
  const isIdValid = Types.ObjectId.isValid(freelancerId);
  const freelancer = await Freelancer.findOne({
    $or: [
      ...(isIdValid ? [{ _id: freelancerId }] : []),
      { userId: freelancerId },
    ],
  });

  if (!freelancer) throw new AppError(404, "Freelancer not found");

  const freelancerUserId = freelancer.userId.toString();
  const clientUserId = clientId.toString();
  const jobObjectId = jobId.toString();

  // 2. Check overlap
  const existingChat = await ChatRoom.findOne({
    jobId: jobObjectId,
    freelancerId: freelancerUserId,
  });

  if (existingChat) return existingChat;

  // 3. Create
  const newChat = await ChatRoom.create({
    jobId: jobObjectId,
    clientId: clientUserId,
    freelancerId: freelancerUserId,
    messages: [],
    status: "active",
  });

  return newChat;
};

const sendMessage = async (
  chatId: string,
  senderId: string, // User ID
  content: string,
  attachments:
    | { name: string; url: string; type: string; size?: number }[]
    | string = []
) => {
  if (
    !content &&
    (!attachments || (Array.isArray(attachments) && attachments.length === 0))
  ) {
    throw new AppError(400, "Message must have content or attachments");
  }

  console.log("Service received attachments:", typeof attachments, attachments);

  // Parse attachments if they come as a string (shouldn't happen but let's be safe)
  let parsedAttachments = attachments;
  if (typeof attachments === "string") {
    try {
      parsedAttachments = JSON.parse(attachments);
      console.log("Parsed stringified attachments:", parsedAttachments);
    } catch (e) {
      console.error("Failed to parse attachments:", e);
      parsedAttachments = [];
    }
  }

  // Populate to get user details for notification
  const chat = await ChatRoom.findById(chatId)
    .populate("clientId", "name profilePicture")
    .populate("freelancerId", "name profilePicture");

  if (!chat) throw new AppError(404, "Chat room not found");

  // Verify participation

  const clientUser = chat.clientId as any;

  const freelancerUser = chat.freelancerId as any;

  const clientId = clientUser._id.toString();
  const freelancerId = freelancerUser._id.toString();

  if (clientId !== senderId && freelancerId !== senderId) {
    throw new AppError(403, "You are not a participant in this chat");
  }

  // Identify receiver
  let receiverId: string;
  let senderName: string;
  let senderPicture: string;

  if (clientId === senderId) {
    receiverId = freelancerId;
    senderName = clientUser.name;
    senderPicture = clientUser.profilePicture;
  } else {
    receiverId = clientId;
    senderName = freelancerUser.name;
    senderPicture = freelancerUser.profilePicture;
  }

  // Create message object for persistence
  const messageForDb = {
    senderId: new Types.ObjectId(senderId),
    content,
    attachments: parsedAttachments,
    readAt: null,
    createdAt: new Date(),
  };

  // Push message to DB
  chat.messages.push(messageForDb as any);
  await chat.save();

  // Create message object for Pusher (plain JSON friendly)
  const messageForPusher = {
    _id: chat.messages[chat.messages.length - 1]?._id,
    senderId: senderId, // Send as string to avoid ObjectId serialization issues
    content,
    attachments: parsedAttachments,
    createdAt: new Date(),
  };

  // Trigger Chat Update
  try {
    await pusher.trigger(`chat-${chatId}`, "new-message", messageForPusher);
  } catch (error) {
    console.error("Pusher chat trigger failed:", error);
  }

  // Trigger Notification to Receiver
  try {
    const notificationData = {
      type: "message",
      chatId,
      senderId,
      senderName,
      senderPicture,
      content:
        content ||
        (parsedAttachments?.length ? "Sent an attachment" : "Sent a message"),
      createdAt: new Date(),
    };

    // 1. Create persistent notification in DB
    await NotificationService.createNotification({
      userId: receiverId,
      senderId: senderId,
      type: "message",
      content: notificationData.content,
      link: `/messages/${chatId}`, // Generic link, frontend will adapt
    });

    // 2. Trigger Pusher event
    await pusher.trigger(
      `user-${receiverId}`,
      "notification",
      notificationData
    );
  } catch (error) {
    console.error("Pusher notification trigger failed:", error);
  }

  return messageForPusher;
};

const getMyChatRooms = async (userId: string) => {
  // Find chats where user is either client OR freelancer
  const chats = await ChatRoom.find({
    $or: [{ clientId: userId }, { freelancerId: userId }],
  })
    .populate("jobId", "title slug")
    .populate("clientId", "name profilePicture") // Populating User fields
    .populate("freelancerId", "name profilePicture") // Populating User fields
    .sort({ updatedAt: -1 })
    .lean();

  const chatsWithUnread = chats.map((chat: any) => {
    const unreadCount = chat.messages.filter(
      (m: any) => !m.readAt && m.senderId.toString() !== userId
    ).length;
    // Don't send all messages list to list view to save bandwidth, just count?
    // Frontend ChatList doesn't display messages, only last message maybe?
    // Existing ChatList displays: {chat.jobId?.title} but no message preview?
    // ChatList.tsx checks otherUser.
    // It seems safe to return all properties, but ideally we should strip messages for list.
    // But let's keep it simple and just add unreadCount.
    return { ...chat, unreadCount };
  });

  return chatsWithUnread;
};

const getChatDetails = async (chatId: string, userId: string) => {
  const chat = await ChatRoom.findById(chatId)
    .populate("jobId", "title slug")
    .populate("clientId", "name profilePicture email")
    .populate("freelancerId", "name profilePicture email");

  if (!chat) throw new AppError(404, "Chat room not found");

  // Robust null checks for populated fields (in case user/client deleted)

  const clientUser = chat.clientId as any;

  const freelancerUser = chat.freelancerId as any;

  // Fallback to ID string if population failed or returned null (shouldn't happen with valid constraint, but safe)
  const clientId = clientUser?._id
    ? clientUser._id.toString()
    : chat.clientId.toString();
  const freelancerId = freelancerUser?._id
    ? freelancerUser._id.toString()
    : chat.freelancerId.toString();

  if (clientId !== userId && freelancerId !== userId) {
    throw new AppError(403, "Access denied");
  }

  return chat;
};

const triggerTyping = async (chatId: string, userId: string) => {
  await pusher.trigger(`chat-${chatId}`, "typing", { userId });
};

const markMessagesAsRead = async (chatId: string, userId: string) => {
  const chat = await ChatRoom.findById(chatId);
  if (!chat) throw new AppError(404, "Chat not found");

  // Update readAt for messages not sent by user
  let updated = false;
  chat.messages.forEach((msg: any) => {
    if (msg.senderId.toString() !== userId && !msg.readAt) {
      msg.readAt = new Date();
      updated = true;
    }
  });

  if (updated) {
    await chat.save();
  }
  return true;
};

export const chatService = {
  createChatRoom,
  sendMessage,
  getMyChatRooms,
  getChatDetails,
  triggerTyping,
  markMessagesAsRead,
};
