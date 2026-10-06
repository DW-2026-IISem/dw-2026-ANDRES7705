"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sale_details_controller_1 = require("./sale-details.controller");
const router = (0, express_1.Router)();
router.get("/sale-details", sale_details_controller_1.saleDetailsController.list);
router.get("/sale-details/:id", sale_details_controller_1.saleDetailsController.getById);
router.post("/sale-details", sale_details_controller_1.saleDetailsController.create);
router.put("/sale-details/:id", sale_details_controller_1.saleDetailsController.replace);
router.patch("/sale-details/:id", sale_details_controller_1.saleDetailsController.update);
router.delete("/sale-details/:id", sale_details_controller_1.saleDetailsController.remove);
exports.default = router;
//# sourceMappingURL=sale-details.routes.js.map