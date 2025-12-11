import { Schema, model, Types } from "mongoose";

export interface INotification {
  userId: Types.ObjectId; // Who receives it
  senderId: Types.ObjectId; // Who sent it
  type: string; // "message" | "system" etc.
  content: string;
  link?: string; // Where to redirect
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    content: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = model<INotification>(
  "Notification",
  notificationSchema
);
