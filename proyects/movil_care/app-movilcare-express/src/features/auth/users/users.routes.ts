import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.get("/users", userController.list);
router.get("/users/:id", userController.getById);
router.post("/users", userController.create);
router.patch("/users/:id", userController.update);
router.delete("/users/:id", userController.deactivate);

export default router;
