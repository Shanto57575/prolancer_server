import express from "express";
import { authRoute } from "../modules/auth/auth.route";
import { userRoute } from "../modules/user/user.route";
import { freelancerRoute } from "../modules/freelancer/freelancer.route";
import { clientRoute } from "../modules/client/client.route";
import { serviceRoute } from "../modules/service/service.route";
import { jobRoutes } from "../modules/job/job.route";

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
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.router);
});

export default router;
