import { Router } from "express";
import { diagnosticsController } from "./diagnostics.controller";
import { serviceAuthorizationsController } from "./service-authorizations.controller";
import { serviceOrdersController } from "./service-orders.controller";

const router = Router();

router.get("/service-orders", serviceOrdersController.list);
router.get("/service-orders/:id", serviceOrdersController.getById);
router.post("/service-orders", serviceOrdersController.create);
router.patch("/service-orders/:id", serviceOrdersController.update);
router.patch("/service-orders/:id/state", serviceOrdersController.changeState);

router.get("/diagnostics", diagnosticsController.list);
router.get("/diagnostics/:id", diagnosticsController.getById);
router.post("/diagnostics", diagnosticsController.create);

router.get("/service-authorizations", serviceAuthorizationsController.list);
router.get("/service-authorizations/:id", serviceAuthorizationsController.getById);
router.post("/service-authorizations", serviceAuthorizationsController.create);

export default router;
