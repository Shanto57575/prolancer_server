import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { clientController } from "./client.controller";

const router = Router();

router.get("/me", checkAuth("CLIENT"), clientController.getMyClientProfile);
router.patch("/me", checkAuth("CLIENT"), clientController.updateClientProfile);

router.post("/create-job", checkAuth("CLIENT"), clientController.createJob);
router.get("/my-jobs", checkAuth("CLIENT"), clientController.getMyJobs);
router.get("/:id", checkAuth(), clientController.getJobById);

export const clientRoute = router;
