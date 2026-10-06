import { Router } from "express";
import { sparePartsController } from "./spare-parts.controller";

const router = Router();

router.get("/spare-parts", sparePartsController.list);
router.get("/spare-parts/:id", sparePartsController.getById);
router.post("/spare-parts", sparePartsController.create);
router.put("/spare-parts/:id", sparePartsController.replace);
router.patch("/spare-parts/:id", sparePartsController.update);
router.delete("/spare-parts/:id", sparePartsController.remove);

export default router;
