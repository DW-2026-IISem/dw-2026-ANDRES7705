import { Router } from "express";
import { serializedUnitsController } from "./serialized-units.controller";

const router = Router();

router.get("/serialized-units", serializedUnitsController.list);
router.get("/serialized-units/:id", serializedUnitsController.getById);
router.post("/serialized-units", serializedUnitsController.create);
router.put("/serialized-units/:id", serializedUnitsController.replace);
router.patch("/serialized-units/:id", serializedUnitsController.update);
router.patch("/serialized-units/:id/sell", serializedUnitsController.sell);
router.patch("/serialized-units/:id/in-service", serializedUnitsController.service);
router.delete("/serialized-units/:id", serializedUnitsController.remove);

export default router;
