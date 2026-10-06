import { Router } from "express";
import { productsController } from "./products.controller";

const router = Router();

router.get("/products", productsController.list);
router.get("/products/:id", productsController.getById);
router.post("/products", productsController.create);
router.put("/products/:id", productsController.replace);
router.patch("/products/:id", productsController.update);
router.delete("/products/:id", productsController.remove);

export default router;
