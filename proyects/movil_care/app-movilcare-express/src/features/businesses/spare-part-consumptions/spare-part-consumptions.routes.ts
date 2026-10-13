import { Router } from "express";
import {
  sparePartConsumptionsController,
} from "./spare-part-consumptions.controller";

const router = Router();

router.get(
  "/spare-part-consumptions",
  sparePartConsumptionsController.list
);

router.get(
  "/spare-part-consumptions/:id",
  sparePartConsumptionsController.getById
);

router.post(
  "/spare-part-consumptions",
  sparePartConsumptionsController.create
);

router.put(
  "/spare-part-consumptions/:id",
  sparePartConsumptionsController.replace
);

router.patch(
  "/spare-part-consumptions/:id",
  sparePartConsumptionsController.update
);

router.delete(
  "/spare-part-consumptions/:id",
  sparePartConsumptionsController.remove
);

export default router;
