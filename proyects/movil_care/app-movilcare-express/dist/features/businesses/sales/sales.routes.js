"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sales_controller_1 = require("./sales.controller");
const router = (0, express_1.Router)();
router.get("/sales", sales_controller_1.salesController.list);
router.get("/sales/:id", sales_controller_1.salesController.getById);
router.post("/sales", sales_controller_1.salesController.create);
router.put("/sales/:id", sales_controller_1.salesController.replace);
router.patch("/sales/:id", sales_controller_1.salesController.update);
router.post("/sales/:id/confirm", sales_controller_1.salesController.confirm);
router.patch("/sales/:id/confirm", sales_controller_1.salesController.confirm);
router.delete("/sales/:id", sales_controller_1.salesController.remove);
exports.default = router;
//# sourceMappingURL=sales.routes.js.map