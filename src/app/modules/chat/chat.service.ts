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

  const freelancerUserId = freelancer.userId;

  // 2. Check overlap
  const existingChat = await ChatRoom.findOne({
    jobId,
    freelancerId: freelancerUserId,
  });

  if (existingChat) return existingChat;

  // 3. Create
  const newChat = await ChatRoom.create({
    jobId,
    clientId,
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
  attachments: { name: string; url: string; type: string }[] = []
) => {
  const chat = await ChatRoom.findById(chatId);
  if (!chat) throw new AppError(404, "Chat room not found");

  // Verify participation
  if (
    chat.clientId.toString() !== senderId &&
    chat.freelancerId.toString() !== senderId
  ) {
    throw new AppError(403, "You are not a participant in this chat");
  }

  const newMessage = {
    senderId: new Types.ObjectId(senderId),
    content,
    attachments,
    createdAt: new Date(),
  };

  // Push message
  chat.messages.push(newMessage);
  await chat.save();

  // Trigger Pusher
  try {
    await pusher.trigger(`chat-${chatId}`, "new-message", newMessage);
  } catch (error) {
    console.error("Pusher trigger failed:", error);
    // Don't fail the request if Pusher fails, just log it
  }

  return newMessage;
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

  if (
    chat.clientId.toString() !== userId &&
    chat.freelancerId.toString() !== userId
  ) {
    throw new AppError(403, "Access denied");
  }

  return chat;
};

export const chatService = {
  createChatRoom,
  sendMessage,
  getMyChatRooms,
  getChatDetails,
};
