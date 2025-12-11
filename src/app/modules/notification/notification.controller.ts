import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await NotificationService.getUserNotifications(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved successfully",
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await NotificationService.markNotificationAsRead(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

const markFromUserAsRead = catchAsync(async (req: Request, res: Response) => {
  // If we want to mark all from a specific sender (for a chat) as read
  // Or just all notifications
  // Let's implement mark ALL for now, or by link/sender.
  // The request will likely come when opening a chat.
  // But for chat read receipts, we handle message status.
  // For notifications (the list), we might want to clear them when chat opens.

  // Let's support marking by link (e.g. chat ID) if provided query param
  // const { chatId } = req.body;
  // Logic to mark by chat ID if needed

  // Logic: Mark all notifications related to this chatId as read
  // But our notification model stores "link", which might contain chatId.
  // Easier: Mark all notifications where type="message" and link contains chatId?
  // Or maybe just clear unread

  const userId = req.user.userId;
  const result = await NotificationService.markAllAsRead(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications marked as read",
    data: result,
  });
});

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markFromUserAsRead,
};
