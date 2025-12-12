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

  return { sessionId: session.id, url: session.url };
};

const handleWebhook = async (signature: string, payload: Buffer) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      envConfig.STRIPE_WEBHOOK_SECRET as string
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new AppError(400, `Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSubscriptionSuccess(session);
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

  if (userId && plan) {
    const user = await User.findById(userId);
    if (user) {
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

      // Create Payment Record for Admin
      await Payment.create({
        userId,
        stripeSessionId: session.id,
        amount: session.amount_total || 0,
        currency: session.currency || "usd",
        plan,
        status: session.payment_status,
      });
    }
  }
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
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "paid") {
    await handleSubscriptionSuccess(session);
    return true;
  }
  return false;
};

export const PaymentService = {
  createCheckoutSession,
  handleWebhook,
  getPaymentHistory,
  getMyPayments,
  verifySession,
};
