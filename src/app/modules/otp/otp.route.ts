import { Router } from "express";
import { OTPController } from "./otp.controller";

const router = Router();

router.post("/send", OTPController.sendOtp);
router.post("/verify", OTPController.verifyOtp);

export const OtpRoutes = router;
