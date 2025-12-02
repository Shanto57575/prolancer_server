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
  "/update",
  checkAuth("FREELANCER"),
  freelancerController.updateFreelancerProfile
);

router.get("/all", checkAuth("ADMIN"), freelancerController.getAllFreelancers);
router.get("/:id", checkAuth(), freelancerController.getFreelancerById);

export default router;
