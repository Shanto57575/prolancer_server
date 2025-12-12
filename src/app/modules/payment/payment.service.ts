import Stripe from "stripe";
import User from "../user/user.model";
import { SubscriptionPlan } from "../user/user.interface";
import { envConfig } from "../../config/envConfig";
import { AppError } from "../../utils/AppError";
import { Payment } from "./payment.model";
import modelQuery from "../../utils/modelQuery";

const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY);

const createCheckoutSession = async (
  userId: string,
  plan: SubscriptionPlan
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Define prices (You should ideally store these in config or DB)
  // These are example Usage. You MUST replace with your actual Stripe Price IDs or create them on the fly.
  // For simplicity, we create them on the fly/use ad-hoc line items if no price ID.
  // But for recurring, Stripe needs a Price ID.
  const prices = {
    [SubscriptionPlan.MONTHLY]: {
      amount: 1900, // $19.00
      name: "Pro Monthly",
    },
    [SubscriptionPlan.YEARLY]: {
      amount: 19000, // $190.00
      name: "Pro Yearly",
    },
  };

  const selectedPrice = prices[plan as keyof typeof prices];
  if (!selectedPrice) {
    throw new AppError(400, "Invalid plan selected");
  }

  // Ensure Stripe Customer
  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() },
    });
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: selectedPrice.name,
            description: "Unlock direct messaging & premium features",
          },
          unit_amount: selectedPrice.amount,
          recurring: {
            interval: plan === SubscriptionPlan.YEARLY ? "year" : "month",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${envConfig.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envConfig.FRONTEND_URL}/payment/cancel`,
    metadata: {
      userId: user._id.toString(),
      plan,
    },
  });

  // Create pending payment record BEFORE redirecting user
  await Payment.create({
    userId: user._id,
    stripeSessionId: session.id,
    amount: selectedPrice.amount,
    currency: "usd",
    plan,
    status: "pending",
  });

  return { sessionId: session.id, url: session.url };
};

const verifyWebhookSignature = async (
  signature: string,
  payload: Buffer
): Promise<boolean> => {
  try {
    stripe.webhooks.constructEvent(
      payload,
      signature,
      envConfig.STRIPE_WEBHOOK_SECRET as string
    );
    return true;
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`Webhook signature verification failed: ${error.message}`);
    return false;
  }
};

const processWebhook = async (signature: string, payload: Buffer) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      envConfig.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`Webhook Error: ${error.message}`);
    return;
  }

  // Check if event already processed (true idempotency using event.id)
  const { StripeEvent } = await import("./stripe-event.model");
  const existingEvent = await StripeEvent.findOne({ eventId: event.id });

  if (existingEvent) {
    console.log(`Event ${event.id} already processed. Skipping duplicate.`);
    return;
  }

  // Record event as processed
  const eventData = {
    eventId: event.id,
    eventType: event.type,
    processed: true,
    ...(event.type === "checkout.session.completed" && {
      sessionId: (event.data.object as Stripe.Checkout.Session).id,
    }),
  };

  await StripeEvent.create(
    eventData as unknown as Parameters<typeof StripeEvent.create>[0]
  );

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSubscriptionSuccess(session);
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment intent succeeded: ${paymentIntent.id}`);
      break;
    }
    case "invoice.payment_succeeded":
      break;
    case "customer.subscription.deleted":
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

const handleSubscriptionSuccess = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as SubscriptionPlan;

  if (!userId || !plan) {
    console.error("Missing userId or plan in session metadata");
    return;
  }

  // Idempotency check: Prevent duplicate processing
  const existingPayment = await Payment.findOne({
    stripeSessionId: session.id,
  });

  if (existingPayment && existingPayment.status === "succeeded") {
    console.log(
      `Payment session ${session.id} already processed. Skipping duplicate.`
    );
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error(`User ${userId} not found for payment session ${session.id}`);
    return;
  }

  // Update user subscription
  user.isPremium = true;
  user.subscriptionPlan = plan;
  // Set end date to 1 month/year from now (approx, webhook typically handles exact periods)
  const now = new Date();
  if (plan === SubscriptionPlan.YEARLY) {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  user.subscriptionEndDate = now;
  await user.save();

  // Update existing pending payment or create new one
  if (existingPayment) {
    existingPayment.status = "succeeded";
    existingPayment.amount = session.amount_total || 0;
    await existingPayment.save();
    console.log(
      `Updated payment ${existingPayment._id} to succeeded for session ${session.id}`
    );
  } else {
    // Fallback: create new payment record if pending wasn't created
    await Payment.create({
      userId,
      stripeSessionId: session.id,
      amount: session.amount_total || 0,
      currency: session.currency || "usd",
      plan,
      status: "succeeded",
    });
    console.log(
      `Created new payment record for session ${session.id} (pending record missing)`
    );
  }

  console.log(
    `Successfully processed payment for user ${userId}, session ${session.id}`
  );
};

const getPaymentHistory = async (query: Record<string, unknown>) => {
  const filters: Record<string, unknown> = {};

  // Extract filters from query if needed (e.g. status, plan)
  // Assuming query contains everything
  const allowedFilters = ["status", "plan", "stripeSessionId"];
  allowedFilters.forEach((field) => {
    if (query[field]) filters[field] = query[field];
  });

  return await modelQuery(Payment, {
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10,
    sortBy: (query.sortBy as string) || "createdAt",
    sortOrder: (query.sortOrder as "asc" | "desc") || "desc",
    search: query.search as string,
    searchableFields: ["stripeSessionId", "plan", "status"], // Basic search
    filters,
    populate: [{ path: "userId", select: "name email" }],
  });
};

const getMyPayments = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const filters: Record<string, unknown> = { userId }; // Force filter by logged-in user

  const allowedFilters = ["status", "plan", "stripeSessionId"];
  allowedFilters.forEach((field) => {
    if (query[field]) filters[field] = query[field];
  });

  return await modelQuery(Payment, {
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10,
    sortBy: (query.sortBy as string) || "createdAt",
    sortOrder: (query.sortOrder as "asc" | "desc") || "desc",
    search: query.search as string,
    searchableFields: ["stripeSessionId", "plan", "status"],
    filters,
    populate: [{ path: "userId", select: "name email" }],
  });
};

const verifySession = async (sessionId: string) => {
  // SECURITY: Only trust database, never Stripe API
  const existingPayment = await Payment.findOne({
    stripeSessionId: sessionId,
  });

  if (!existingPayment) {
    // No payment record = not paid
    return { isPaid: false, processed: false };
  }

  // Check database status only
  return {
    isPaid: existingPayment.status === "succeeded",
    processed: existingPayment.status === "succeeded",
  };
};

export const PaymentService = {
  createCheckoutSession,
  verifyWebhookSignature,
  processWebhook,
  getPaymentHistory,
  getMyPayments,
  verifySession,
};
