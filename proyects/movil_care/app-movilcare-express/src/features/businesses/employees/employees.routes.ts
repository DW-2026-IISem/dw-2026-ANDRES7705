import { Router } from "express";
import { employeesController } from "./employees.controller";

const router = Router();

router.get("/employees", employeesController.list);
router.get("/employees/:id", employeesController.getById);
router.post("/employees", employeesController.create);
router.put("/employees/:id", employeesController.replace);
router.patch("/employees/:id", employeesController.update);
router.delete("/employees/:id", employeesController.remove);

export default router;
