import { Router } from "express";
import { productsController } from "./products.controller";

const router = Router();

router.get("/products", productsController.list);
router.get("/products/:id", productsController.getById);
router.post(
  "/products",
  productsController.validateProductTypeForCreate,
  productsController.create
);
router.put(
  "/products/:id",
  productsController.validateProductTypeForCreate,
  productsController.replace
);
router.patch(
  "/products/:id",
  productsController.validateProductTypeForUpdate,
  productsController.update
);
router.delete("/products/:id", productsController.remove);
router.delete("/products/:id/permanent", productsController.deletePhysical);
router.patch("/products/:id/deactivate", productsController.deactivate);

export default router;
