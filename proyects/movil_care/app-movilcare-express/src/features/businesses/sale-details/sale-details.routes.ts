import { Router } from "express";
import { saleDetailsController } from "./sale-details.controller";

const router = Router();

router.get("/sale-details", saleDetailsController.list);
router.get("/sale-details/:id", saleDetailsController.getById);
router.post("/sale-details", saleDetailsController.create);
router.put("/sale-details/:id", saleDetailsController.replace);
router.patch("/sale-details/:id", saleDetailsController.update);
router.delete("/sale-details/:id", saleDetailsController.remove);

export default router;
