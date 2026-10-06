import { createCrudController } from "../shared/crud.controller";
import { Customer } from "./customers.model";

export const customersController = createCrudController(Customer, {
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
