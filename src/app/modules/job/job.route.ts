import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../constants/enums";
import { jobController } from "./job.controller";

const router = Router();

router.post("/", checkAuth(UserRole.CLIENT), jobController.createJob);

router.get("/my-jobs", checkAuth(UserRole.CLIENT), jobController.getMyJobs);

router.patch("/:id", checkAuth(UserRole.CLIENT), jobController.updateJob);

router.delete("/:id", checkAuth(UserRole.CLIENT), jobController.deleteJob);

router.get("/", checkAuth(UserRole.ADMIN), jobController.getAllJobs);

router.get("/:id", checkAuth(), jobController.getJobById);

export const jobRoutes = router;
