"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
class Product extends sequelize_1.Model {
}
exports.Product = Product;
Product.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    sku: { type: sequelize_1.DataTypes.STRING(40), allowNull: false, unique: true },
    name: { type: sequelize_1.DataTypes.STRING(150), allowNull: false },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    type: { type: sequelize_1.DataTypes.ENUM("EQUIPMENT", "ACCESSORY"), allowNull: false },
    brand: { type: sequelize_1.DataTypes.STRING(80), allowNull: true },
    model: { type: sequelize_1.DataTypes.STRING(80), allowNull: true },
    requiresSerial: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    cost: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: { min: 0 },
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    taxPercentage: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    defaultWarrantyMonths: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
    sequelize: db_1.sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=products.model.js.map