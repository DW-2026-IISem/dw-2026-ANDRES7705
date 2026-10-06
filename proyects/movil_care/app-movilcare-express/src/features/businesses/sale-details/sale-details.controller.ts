import { createCrudController } from "../shared/crud.controller";
import { SaleDetail } from "./sale-details.model";

export const saleDetailsController = createCrudController(SaleDetail, {
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

export default saleDetailsController;
