import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../constants/enums";

const router = Router();

router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.CLIENT, UserRole.FREELANCER),
  NotificationController.getMyNotifications
);

router.patch(
  "/read-all",
  checkAuth(UserRole.ADMIN, UserRole.CLIENT, UserRole.FREELANCER),
  NotificationController.markFromUserAsRead
);

router.patch(
  "/:id/read",
  checkAuth(UserRole.ADMIN, UserRole.CLIENT, UserRole.FREELANCER),
  NotificationController.markAsRead
);

export const NotificationRoutes = router;
