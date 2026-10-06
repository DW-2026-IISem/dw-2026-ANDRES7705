import { Router } from "express";
import { salesController } from "./sales.controller";

const router = Router();

router.get("/sales", salesController.list);
router.get("/sales/:id", salesController.getById);
router.post("/sales", salesController.create);
router.put("/sales/:id", salesController.replace);
router.patch("/sales/:id", salesController.update);
router.post("/sales/:id/confirm", salesController.confirm);
router.patch("/sales/:id/confirm", salesController.confirm);
router.delete("/sales/:id", salesController.remove);

export default router;
