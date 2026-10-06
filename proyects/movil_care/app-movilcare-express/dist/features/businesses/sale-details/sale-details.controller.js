"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleDetailsController = void 0;
const crud_controller_1 = require("../shared/crud.controller");
const sale_details_model_1 = require("./sale-details.model");
exports.saleDetailsController = (0, crud_controller_1.createCrudController)(sale_details_model_1.SaleDetail, {
    fields: [
        "saleId",
        "productId",
        "serializedUnitId",
        "quantity",
        "unitPrice",
        "discount",
        "taxPercentage",
        "total",
        "notes",
    ],
    requiredFields: ["saleId", "productId", "quantity", "unitPrice", "total"],
});
exports.default = exports.saleDetailsController;
//# sourceMappingURL=sale-details.controller.js.map