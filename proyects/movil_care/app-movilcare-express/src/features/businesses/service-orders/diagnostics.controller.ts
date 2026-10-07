import { createCrudController } from "../shared/crud.controller";
import { Diagnostic, DIAGNOSTIC_CAUSES } from "./diagnostics.model";

export const diagnosticsController = createCrudController(Diagnostic, {
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

export { DIAGNOSTIC_CAUSES };
