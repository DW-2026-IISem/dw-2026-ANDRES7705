import { createCrudController } from "../shared/crud.controller";
import { SparePart } from "./spare-parts.model";

export const sparePartsController = createCrudController(SparePart, {
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
