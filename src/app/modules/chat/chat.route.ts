import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../constants/enums";
import { chatController } from "./chat.controller";

const router = Router();

router.get(
  "/my-chats",
  checkAuth(UserRole.CLIENT, UserRole.FREELANCER),
  chatController.getMyChatRooms
);

router.get(
  "/:chatId",
  checkAuth(UserRole.CLIENT, UserRole.FREELANCER),
  chatController.getChatDetails
);

router.post(
  "/:chatId/messages",
  checkAuth(UserRole.CLIENT, UserRole.FREELANCER),
  chatController.sendMessage
);

router.post("/", checkAuth(UserRole.CLIENT), chatController.createChat);

router.post(
  "/:chatId/typing",
  checkAuth(UserRole.CLIENT, UserRole.FREELANCER),
  chatController.triggerTyping
);

export const chatRoutes = router;
