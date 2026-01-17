import express from "express";
import { authRoute } from "../modules/auth/auth.route";
import { userRoute } from "../modules/user/user.route";
import { freelancerRoute } from "../modules/freelancer/freelancer.route";
import { clientRoute } from "../modules/client/client.route";
import { serviceRoute } from "../modules/service/service.route";
import { jobRoutes } from "../modules/job/job.route";
import { applicationRoutes } from "../modules/application/application.route";
import { chatRoutes } from "../modules/chat/chat.route";
import { NotificationRoutes } from "../modules/notification/notification.route";
import { dashboardRoutes } from "../modules/dashboard/dashboard.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { OtpRoutes } from "../modules/otp/otp.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    router: authRoute,
  },
  {
    path: "/user",
    router: userRoute,
  },
  {
    path: "/client",
    router: clientRoute,
  },
  {
    path: "/freelancer",
    router: freelancerRoute,
  },

  {
    path: "/service",
    router: serviceRoute,
  },
  {
    path: "/jobs",
    router: jobRoutes,
  },
  {
    path: "/applications",
    router: applicationRoutes,
  },
  {
    path: "/chats",
    router: chatRoutes,
  },
  {
    path: "/notification",
    router: NotificationRoutes,
  },
  {
    path: "/dashboard",
    router: dashboardRoutes,
  },
  {
    path: "/payment",
    router: PaymentRoutes,
  },
  {
    path: "/otp",
    router: OtpRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.router);
});

export default router;
