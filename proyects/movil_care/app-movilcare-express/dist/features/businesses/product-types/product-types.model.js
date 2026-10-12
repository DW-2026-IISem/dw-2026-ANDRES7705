"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductType = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
class ProductType extends sequelize_1.Model {
}
exports.ProductType = ProductType;
ProductType.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
    description: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "inactive",
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "ProductType",
    tableName: "product_types",
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=product-types.model.js.map