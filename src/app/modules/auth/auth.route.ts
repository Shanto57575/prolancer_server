import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();

router.post("/login", authController.loginController);
router.post("/refresh-token", authController.refreshTokenController);

export const authRoute = router;
