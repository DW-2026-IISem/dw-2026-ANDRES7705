import { Router } from "express";
import { rolesController } from "./roles.controller";

const router = Router();

router.get("/roles", rolesController.list);
router.get("/roles/:id", rolesController.getById);
router.post("/roles", rolesController.create);

export default router;
