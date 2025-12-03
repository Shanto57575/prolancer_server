// freelancer.route.ts
import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { freelancerController } from "./freelancer.controller";

const router = Router();

router.get(
  "/me",
  checkAuth("FREELANCER"),
  freelancerController.getMyFreelancerProfile
);

router.patch(
  "/me",
  checkAuth("FREELANCER"),
  freelancerController.updateFreelancerProfile
);

router.get(
  "/all-freelancers",
  checkAuth("ADMIN"),
  freelancerController.getAllFreelancers
);

router.get("/:id", checkAuth(), freelancerController.getFreelancerById);

export const freelancerRoute = router;
