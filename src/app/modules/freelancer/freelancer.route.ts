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

router.get("/public", freelancerController.getPublicFreelancers);

router.get("/all-freelancers", freelancerController.getAllFreelancers);

router.get("/:id", freelancerController.getFreelancerById);

export const freelancerRoute = router;
