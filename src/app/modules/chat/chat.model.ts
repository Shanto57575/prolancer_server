import { Schema, model } from "mongoose";
import { IChatRoom, IMessage } from "./chat.interface";

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    attachments: {
      type: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          type: { type: String, required: true },
          size: { type: Number, required: false },
        },
      ],
      default: [],
    },
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

chatRoomSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

export const ChatRoom = model<IChatRoom>("ChatRoom", chatRoomSchema);
