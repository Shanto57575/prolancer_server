import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../constants/enums";
import { chatController } from "./chat.controller";

const router = Router();

// Get all chat rooms for the logged-in user (Client or Freelancer)
router.get(
  "/my-chats",
  checkAuth(UserRole.CLIENT, UserRole.FREELANCER),
  chatController.getMyChatRooms
);

// Get specific chat details
router.get(
  "/:chatId",
  checkAuth(UserRole.CLIENT, UserRole.FREELANCER),
  chatController.getChatDetails
);

// Send a message
router.post(
  "/:chatId/messages",
  checkAuth(UserRole.CLIENT, UserRole.FREELANCER),
  chatController.sendMessage
);

// Create or retrieve a chat room
router.post(
  "/",
  checkAuth(UserRole.CLIENT), // Mostly clients initiate from job page, but logic supports both if needed
  chatController.createChat
);

export const chatRoutes = router;
