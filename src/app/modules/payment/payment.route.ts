import express from "express";
import { PaymentController } from "./payment.controller";
import { UserRole } from "../../constants/enums";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

router.post(
  "/create-checkout-session",
  checkAuth(UserRole.FREELANCER),
  PaymentController.createCheckoutSession
);

router.post("/verify-session", PaymentController.verifySession);

// Webhook route - needs special handling for raw body in app.ts
router.post("/webhook", PaymentController.handleWebhook);

router.get(
  "/my-payments",
  checkAuth(UserRole.FREELANCER, UserRole.CLIENT),
  PaymentController.getMyPayments
);

router.get(
  "/history",
  checkAuth(UserRole.ADMIN),
  PaymentController.getPaymentHistory
);

export const PaymentRoutes = router;
