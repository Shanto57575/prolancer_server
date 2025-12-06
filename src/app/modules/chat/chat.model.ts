import { Schema, model } from "mongoose";
import { IChatRoom, IMessage } from "./chat.interface";

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Can be Client or Freelancer (User model)
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String, // 'pdf', 'image', etc.
      },
    ],
  },
  {
    timestamps: true,
  }
);

const chatRoomSchema = new Schema<IChatRoom>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup of existing chats
chatRoomSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

export const ChatRoom = model<IChatRoom>("ChatRoom", chatRoomSchema);
