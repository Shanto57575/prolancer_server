import express from "express";
import { serviceController } from "./service.control";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../constants/enums";

const router = express.Router();

router.post(
  "/add-service",
  checkAuth(UserRole.ADMIN),
  serviceController.createService
);

router.get("/all-services", serviceController.getAllService);
router.get("/:id", checkAuth(UserRole.ADMIN), serviceController.getServiceById);
router.put("/:id", checkAuth(UserRole.ADMIN), serviceController.updateService);
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  serviceController.deleteService
);

export const serviceRoute = router;
