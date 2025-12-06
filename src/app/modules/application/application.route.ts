import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../constants/enums";
import { applicationController } from "./application.controller";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.FREELANCER),
  applicationController.createApplication
);

router.get(
  "/my-applications",
  checkAuth(UserRole.FREELANCER),
  applicationController.getMyApplications
);

router.get(
  "/job/:jobId",
  checkAuth(UserRole.CLIENT),
  applicationController.getJobApplications
);

router.patch(
  "/:id/status",
  checkAuth(UserRole.CLIENT),
  applicationController.updateApplicationStatus
);

export const applicationRoutes = router;
