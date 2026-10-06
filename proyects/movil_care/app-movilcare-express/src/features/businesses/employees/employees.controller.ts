import { createCrudController } from "../shared/crud.controller";
import { Employee } from "./employees.model";

export const employeesController = createCrudController(Employee, {
  fields: ["name", "document", "role", "email", "isActive"],
  requiredFields: ["name", "role"],
  softDeleteField: "isActive",
});
