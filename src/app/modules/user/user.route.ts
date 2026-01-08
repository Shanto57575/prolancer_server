import express from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../constants/enums";

const router = express.Router();

router.post("/register", userController.registerController);
router.get("/me", checkAuth(), userController.getMyProfileController);
router.patch("/me", checkAuth(), userController.updateMyProfileController);

router.get(
  "/",
  checkAuth(UserRole.ADMIN),
  userController.getAllUsersController
);

router.patch(
  "/:id/ban",
  checkAuth(UserRole.ADMIN),
  userController.banUserController
);

export const userRoute = router;
