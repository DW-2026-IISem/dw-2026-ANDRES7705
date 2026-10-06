"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializedUnit = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const products_model_1 = require("../products/products.model");
class SerializedUnit extends sequelize_1.Model {
}
exports.SerializedUnit = SerializedUnit;
SerializedUnit.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    productId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: products_model_1.Product,
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: {
            notNull: { msg: "productId is required" },
        },
    },
    serial: {
        type: sequelize_1.DataTypes.STRING(80),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: "serial is required" },
        },
    },
    secondarySerial: {
        type: sequelize_1.DataTypes.STRING(80),
        allowNull: true,
        unique: true,
        validate: {
            notEmpty: { msg: "secondarySerial cannot be empty" },
        },
    },
    state: {
        type: sequelize_1.DataTypes.ENUM("IN_STOCK", "SOLD", "IN_SERVICE", "RETIRED"),
        allowNull: false,
        defaultValue: "IN_STOCK",
        validate: {
            isIn: {
                args: [["IN_STOCK", "SOLD", "IN_SERVICE", "RETIRED"]],
                msg: "state must be one of IN_STOCK, SOLD, IN_SERVICE, RETIRED",
            },
        },
    },
    receivedAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
    sequelize: db_1.sequelize,
    modelName: "SerializedUnit",
    tableName: "serialized_units",
    timestamps: true,
    underscored: true,
});
products_model_1.Product.hasMany(SerializedUnit, {
    foreignKey: "productId",
    as: "serializedUnits",
});
SerializedUnit.belongsTo(products_model_1.Product, {
    foreignKey: "productId",
    as: "product",
});
exports.default = SerializedUnit;
//# sourceMappingURL=serialized-units.model.js.map