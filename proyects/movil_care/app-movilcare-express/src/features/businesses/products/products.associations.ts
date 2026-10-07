import { Product } from "./products.model";
import { ProductType } from "../product-types/product-types.model";

Product.belongsTo(ProductType, {
  foreignKey: "productTypeId",
  as: "productType",
});

ProductType.hasMany(Product, {
  foreignKey: "productTypeId",
  as: "products",
});
