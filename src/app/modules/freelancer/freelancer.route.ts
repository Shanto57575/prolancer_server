import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { freelancerController } from "./freelancer.controller";
import { UserRole } from "../../constants/enums";

const router = Router();

router.get(
  "/me",
  checkAuth(UserRole.FREELANCER),
  freelancerController.getMyFreelancerProfile
);

router.patch(
  "/me",
  checkAuth(UserRole.FREELANCER),
  freelancerController.updateFreelancerProfile
);

router.get(
  "/all-freelancers",
  checkAuth(UserRole.ADMIN),
  freelancerController.getAllFreelancers
);

router.get(
  "/:id",
  checkAuth(UserRole.ADMIN),
  freelancerController.getFreelancerById
);

export const freelancerRoute = router;
