import { Router } from "express";
import { productTypesController } from "./product-types.controller";

const router = Router();

router.get("/product-types", productTypesController.list);
router.get("/product-types/:id", productTypesController.getById);
router.post("/product-types", productTypesController.create);
router.put("/product-types/:id", productTypesController.replace);
router.patch("/product-types/:id", productTypesController.update);
router.delete("/product-types/:id", productTypesController.remove);
router.patch("/product-types/:id/deactivate", productTypesController.deactivate);

export default router;
