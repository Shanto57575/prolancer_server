import express from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

router.post("/register", userController.registerController);
router.get("/me", checkAuth(), userController.getMyProfileController);
router.patch("/me", checkAuth(), userController.updateMyProfileController);

export const userRoute = router;
