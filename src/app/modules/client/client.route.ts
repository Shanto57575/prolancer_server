import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { clientController } from "./client.controller";
import { UserRole } from "../../constants/enums";

const router = Router();

router.get(
  "/me",
  checkAuth(UserRole.CLIENT),
  clientController.getMyClientProfile
);
router.patch(
  "/me",
  checkAuth(UserRole.CLIENT),
  clientController.updateClientProfile
);

export const clientRoute = router;
