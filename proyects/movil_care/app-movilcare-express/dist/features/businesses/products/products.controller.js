"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsController = void 0;
const crud_controller_1 = require("../shared/crud.controller");
const products_model_1 = require("./products.model");
exports.productsController = (0, crud_controller_1.createCrudController)(products_model_1.Product, {
    fields: [
        "sku",
        "name",
        "description",
        "type",
        "brand",
        "model",
        "requiresSerial",
        "cost",
        "price",
        "taxPercentage",
        "defaultWarrantyMonths",
        "isActive",
    ],
    requiredFields: ["sku", "name", "type", "price"],
    softDeleteField: "isActive",
});
//# sourceMappingURL=products.controller.js.map