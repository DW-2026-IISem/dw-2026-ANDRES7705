"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employees_controller_1 = require("./employees.controller");
const router = (0, express_1.Router)();
router.get("/employees", employees_controller_1.employeesController.list);
router.get("/employees/:id", employees_controller_1.employeesController.getById);
router.post("/employees", employees_controller_1.employeesController.create);
router.put("/employees/:id", employees_controller_1.employeesController.replace);
router.patch("/employees/:id", employees_controller_1.employeesController.update);
router.delete("/employees/:id", employees_controller_1.employeesController.remove);
exports.default = router;
//# sourceMappingURL=employees.routes.js.map