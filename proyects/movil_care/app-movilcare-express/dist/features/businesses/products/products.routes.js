"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("./products.controller");
const router = (0, express_1.Router)();
router.get("/products", products_controller_1.productsController.list);
router.get("/products/:id", products_controller_1.productsController.getById);
router.post("/products", products_controller_1.productsController.create);
router.put("/products/:id", products_controller_1.productsController.replace);
router.patch("/products/:id", products_controller_1.productsController.update);
router.delete("/products/:id", products_controller_1.productsController.remove);
exports.default = router;
//# sourceMappingURL=products.routes.js.map