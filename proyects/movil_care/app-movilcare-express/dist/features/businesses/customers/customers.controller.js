"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersController = void 0;
const crud_controller_1 = require("../shared/crud.controller");
const customers_model_1 = require("./customers.model");
exports.customersController = (0, crud_controller_1.createCrudController)(customers_model_1.Customer, {
    fields: [
        "documentType",
        "documentNumber",
        "firstName",
        "lastName",
        "companyName",
        "phone",
        "email",
        "address",
        "isActive",
    ],
    requiredFields: ["documentType", "documentNumber", "firstName"],
    softDeleteField: "isActive",
});
//# sourceMappingURL=customers.controller.js.map