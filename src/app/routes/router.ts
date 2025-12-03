import express from "express";
import { authRoute } from "../modules/auth/auth.route";
import { userRoute } from "../modules/user/user.route";
import { freelancerRoute } from "../modules/freelancer/freelancer.route";
import { clientRoute } from "../modules/client/client.route";

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
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.router);
});

export default router;
