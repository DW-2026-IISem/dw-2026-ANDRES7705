"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_types_controller_1 = require("./product-types.controller");
const router = (0, express_1.Router)();
router.get("/product-types", product_types_controller_1.productTypesController.list);
router.get("/product-types/:id", product_types_controller_1.productTypesController.getById);
router.post("/product-types", product_types_controller_1.productTypesController.create);
router.put("/product-types/:id", product_types_controller_1.productTypesController.replace);
router.patch("/product-types/:id", product_types_controller_1.productTypesController.update);
router.delete("/product-types/:id", product_types_controller_1.productTypesController.remove);
router.patch("/product-types/:id/deactivate", product_types_controller_1.productTypesController.deactivate);
exports.default = router;
//# sourceMappingURL=product-types.routes.js.map