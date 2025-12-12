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

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  // Use raw body in app.ts for this route
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request = req as any;
  if (!request.rawBody) throw new Error("Raw body missing for webhook");
  await PaymentService.handleWebhook(signature, request.rawBody);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Webhook received",
  });
});

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

  const isPaid = await PaymentService.verifySession(sessionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: isPaid
      ? "Payment verification successful"
      : "Payment not completed",
    data: { isPaid },
  });
});

export const PaymentController = {
  createCheckoutSession,
  handleWebhook,
  getPaymentHistory,
  getMyPayments,
  verifySession,
};
