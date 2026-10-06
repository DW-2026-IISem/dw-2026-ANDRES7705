import { Router } from "express";
import { customersController } from "./customers.controller";

const router = Router();

router.get("/customers", customersController.list);
router.get("/customers/:id", customersController.getById);
router.post("/customers", customersController.create);
router.put("/customers/:id", customersController.replace);
router.patch("/customers/:id", customersController.update);
router.delete("/customers/:id", customersController.remove);

export default router;
