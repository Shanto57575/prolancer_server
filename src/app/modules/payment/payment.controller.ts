import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const { plan } = req.body;
    const userId = req.user._id;

    const result = await PaymentService.createCheckoutSession(userId, plan);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Checkout session created successfully",
      data: result,
    });
  }
);

const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = req as any;

    if (!request.rawBody) {
      return res.status(400).json({ error: "Raw body missing for webhook" });
    }

    // Verify signature first - if this fails, return 400 immediately
    const isValid = await PaymentService.verifyWebhookSignature(
      signature,
      request.rawBody
    );

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Send 200 OK immediately to Stripe
    res.status(200).json({ received: true });

    // Process webhook asynchronously (don't await)
    PaymentService.processWebhook(signature, request.rawBody).catch((err) => {
      console.error("Webhook processing error:", err);
    });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(400).json({ error: "Webhook handler failed" });
  }
};

const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentHistory(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment history retrieved",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const result = await PaymentService.getMyPayments(userId, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My payments retrieved",
    data: result,
  });
});

const verifySession = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  const result = await PaymentService.verifySession(sessionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.isPaid
      ? result.processed
        ? "Payment verified successfully"
        : "Payment completed, processing..."
      : "Payment not completed",
    data: result,
  });
});

export const PaymentController = {
  createCheckoutSession,
  handleWebhook,
  getPaymentHistory,
  getMyPayments,
  verifySession,
};
