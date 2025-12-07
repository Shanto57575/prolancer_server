/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { AppError } from "../../utils/AppError";
import Freelancer from "../freelancer/freelancer.model";
import { ChatRoom } from "./chat.model";
import pusher from "../../utils/pusher";

const createChatRoom = async (
  jobId: string,
  clientId: string,
  freelancerId: string // This is Freelancer Model ID (from Application)
) => {
  // 1. Get Freelancer User ID
  const freelancer = await Freelancer.findById(freelancerId);
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

  const chat = await ChatRoom.findById(chatId);
  if (!chat) throw new AppError(404, "Chat room not found");

  // Verify participation
  const clientId = chat.clientId.toString();
  const freelancerId = chat.freelancerId.toString();

  if (clientId !== senderId && freelancerId !== senderId) {
    throw new AppError(403, "You are not a participant in this chat");
  }

  // Create message object for persistence
  const messageForDb = {
    senderId: new Types.ObjectId(senderId),
    content,
    attachments: parsedAttachments,
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

  // Trigger Pusher
  console.log(
    "Triggering Pusher event:",
    `chat-${chatId}`,
    "new-message",
    messageForPusher
  );
  try {
    await pusher.trigger(`chat-${chatId}`, "new-message", messageForPusher);
    console.log("Pusher event triggered successfully");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Pusher trigger failed:", error);
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
    .sort({ updatedAt: -1 });

  return chats;
};

const getChatDetails = async (chatId: string, userId: string) => {
  const chat = await ChatRoom.findById(chatId)
    .populate("jobId", "title slug")
    .populate("clientId", "name profilePicture email")
    .populate("freelancerId", "name profilePicture email");

  if (!chat) throw new AppError(404, "Chat room not found");

  // Robust null checks for populated fields (in case user/client deleted)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientUser = chat.clientId as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const chatService = {
  createChatRoom,
  sendMessage,
  getMyChatRooms,
  getChatDetails,
  triggerTyping,
};
