import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { clientController } from "./client.controller";

const router = Router();

router.get("/me", checkAuth("CLIENT"), clientController.getMyClientProfile);
router.patch(
  "/update",
  checkAuth("CLIENT"),
  clientController.updateClientProfile
);

router.post("/job", checkAuth("CLIENT"), clientController.createJob);
router.get("/jobs", checkAuth("CLIENT"), clientController.getMyJobs);
router.get("/job/:id", checkAuth(), clientController.getJobById);

export default router;
