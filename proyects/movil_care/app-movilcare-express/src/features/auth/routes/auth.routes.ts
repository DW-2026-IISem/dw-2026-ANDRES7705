
import { Router } from "express";
import {
  loginController,
  refreshController,
  logoutController,
} from "../controllers/auth.controller";

const router = Router();

router.post("/auth/login", loginController);
router.post("/auth/refresh", refreshController);
router.post("/auth/logout", logoutController);

export default router;
