
import { Router } from "express";
import { paymentsController } from "./payments.controller";

const router = Router();

router.get("/payments", paymentsController.list);
router.get("/payments/:id", paymentsController.getById);
router.post("/payments", paymentsController.create);
router.put("/payments/:id", paymentsController.replace);
router.patch("/payments/:id", paymentsController.update);
router.delete("/payments/:id", paymentsController.remove);

export default router;
