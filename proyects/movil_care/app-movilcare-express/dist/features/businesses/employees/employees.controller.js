"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeesController = void 0;
const crud_controller_1 = require("../shared/crud.controller");
const employees_model_1 = require("./employees.model");
exports.employeesController = (0, crud_controller_1.createCrudController)(employees_model_1.Employee, {
    fields: ["name", "document", "role", "email", "isActive"],
    requiredFields: ["name", "role"],
    softDeleteField: "isActive",
});
//# sourceMappingURL=employees.controller.js.map