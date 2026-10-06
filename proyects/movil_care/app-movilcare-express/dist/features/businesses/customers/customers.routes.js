"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customers_controller_1 = require("./customers.controller");
const router = (0, express_1.Router)();
router.get("/customers", customers_controller_1.customersController.list);
router.get("/customers/:id", customers_controller_1.customersController.getById);
router.post("/customers", customers_controller_1.customersController.create);
router.put("/customers/:id", customers_controller_1.customersController.replace);
router.patch("/customers/:id", customers_controller_1.customersController.update);
router.delete("/customers/:id", customers_controller_1.customersController.remove);
exports.default = router;
//# sourceMappingURL=customers.routes.js.map