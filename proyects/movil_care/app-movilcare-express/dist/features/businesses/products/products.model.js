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
    productTypeId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        field: "product_type_id",
        references: { model: "product_types", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    stockQuantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
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
    hooks: {
        beforeValidate: (product) => {
            if (product.requiresSerial && Number(product.stockQuantity) !== 0) {
                throw new Error("Serialized products must use SerializedUnit inventory, not stockQuantity");
            }
        },
    },
});
//# sourceMappingURL=products.model.js.map