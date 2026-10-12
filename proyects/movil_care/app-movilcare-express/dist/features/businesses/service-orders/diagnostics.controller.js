"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIAGNOSTIC_CAUSES = exports.diagnosticsController = void 0;
const crud_controller_1 = require("../shared/crud.controller");
const diagnostics_model_1 = require("./diagnostics.model");
Object.defineProperty(exports, "DIAGNOSTIC_CAUSES", { enumerable: true, get: function () { return diagnostics_model_1.DIAGNOSTIC_CAUSES; } });
exports.diagnosticsController = (0, crud_controller_1.createCrudController)(diagnostics_model_1.Diagnostic, {
    fields: [
        "serviceOrderId",
        "technicianId",
        "description",
        "cause",
        "warrantyCovered",
        "laborCost",
        "estimatedTotal",
        "diagnosedAt",
    ],
    requiredFields: ["serviceOrderId", "technicianId", "description", "cause", "diagnosedAt"],
});
//# sourceMappingURL=diagnostics.controller.js.map