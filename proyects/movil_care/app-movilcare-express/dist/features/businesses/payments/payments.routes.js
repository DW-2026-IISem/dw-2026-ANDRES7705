"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payments_controller_1 = require("./payments.controller");
const router = (0, express_1.Router)();
router.get("/payments", payments_controller_1.paymentsController.list);
router.get("/payments/:id", payments_controller_1.paymentsController.getById);
router.post("/payments", payments_controller_1.paymentsController.create);
router.put("/payments/:id", payments_controller_1.paymentsController.replace);
router.patch("/payments/:id", payments_controller_1.paymentsController.update);
router.delete("/payments/:id", payments_controller_1.paymentsController.remove);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map