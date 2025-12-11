import { NotificationModel } from "./notification.model";

const getUserNotifications = async (userId: string) => {
  return await NotificationModel.find({ userId })
    .populate("senderId", "name profilePicture")
    .sort({ createdAt: -1 })
    .limit(20); // Limit to last 20 for performance
};

const markNotificationAsRead = async (id: string) => {
  return await NotificationModel.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );
};

const markAllAsRead = async (userId: string) => {
  return await NotificationModel.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

const createNotification = async (data: {
  userId: string;
  senderId: string;
  type: string;
  content: string;
  link?: string;
}) => {
  return await NotificationModel.create(data);
};

export const NotificationService = {
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  createNotification,
};
