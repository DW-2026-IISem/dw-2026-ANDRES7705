import { Router } from "express";
import { warrantiesController } from "./warranties.controller";

const router = Router();

router.get("/warranties", warrantiesController.list);
router.get("/warranties/:id", warrantiesController.getById);
router.post("/warranties", warrantiesController.create);
router.put("/warranties/:id", warrantiesController.replace);
router.patch("/warranties/:id", warrantiesController.update);
router.delete("/warranties/:id", warrantiesController.remove);

export default router;
