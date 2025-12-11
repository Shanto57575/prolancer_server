import express from "express";
import { dashboardController } from "./dashboard.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../constants/enums";

const router = express.Router();

router.get(
  "/stats",
  checkAuth(UserRole.ADMIN, UserRole.CLIENT, UserRole.FREELANCER),
  dashboardController.getDashboardStats
);

export const dashboardRoutes = router;
