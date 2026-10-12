"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const products_model_1 = require("./products.model");
const product_types_model_1 = require("../product-types/product-types.model");
products_model_1.Product.belongsTo(product_types_model_1.ProductType, {
    foreignKey: "productTypeId",
    as: "productType",
});
product_types_model_1.ProductType.hasMany(products_model_1.Product, {
    foreignKey: "productTypeId",
    as: "products",
});
//# sourceMappingURL=products.associations.js.map