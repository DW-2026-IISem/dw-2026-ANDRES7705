import { createCrudController } from "../shared/crud.controller";
import { Product } from "./products.model";

export const productsController = createCrudController(Product, {
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
