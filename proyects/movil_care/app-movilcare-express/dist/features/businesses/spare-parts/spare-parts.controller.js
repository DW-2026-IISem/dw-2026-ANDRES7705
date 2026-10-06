"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sparePartsController = void 0;
const crud_controller_1 = require("../shared/crud.controller");
const spare_parts_model_1 = require("./spare-parts.model");
exports.sparePartsController = (0, crud_controller_1.createCrudController)(spare_parts_model_1.SparePart, {
    fields: [
        "sku",
        "name",
        "description",
        "compatibility",
        "cost",
        "price",
        "currentStock",
        "minimumStock",
        "isActive",
    ],
    requiredFields: ["sku", "name"],
    softDeleteField: "isActive",
});
//# sourceMappingURL=spare-parts.controller.js.map