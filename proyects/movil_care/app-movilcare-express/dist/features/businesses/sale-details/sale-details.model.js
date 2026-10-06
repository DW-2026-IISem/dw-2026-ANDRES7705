"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleDetail = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const products_model_1 = require("../products/products.model");
const sales_model_1 = require("../sales/sales.model");
const serialized_units_model_1 = require("../serialized-units/serialized-units.model");
class SaleDetail extends sequelize_1.Model {
}
exports.SaleDetail = SaleDetail;
SaleDetail.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    saleId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: sales_model_1.Sale,
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: {
            notNull: { msg: "saleId is required" },
        },
    },
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
    serializedUnitId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
        unique: true,
        references: {
            model: serialized_units_model_1.SerializedUnit,
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: { args: [1], msg: "quantity must be greater than 0" },
        },
    },
    unitPrice: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    discount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    taxPercentage: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
        validate: { min: 0 },
    },
    total: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    notes: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "SaleDetail",
    tableName: "sale_details",
    timestamps: true,
    underscored: true,
    hooks: {
        beforeValidate: (detail) => {
            if (detail.serializedUnitId !== null && detail.serializedUnitId !== undefined) {
                if (detail.quantity !== 1) {
                    throw new Error("quantity must be 1 when a serialized unit is assigned");
                }
            }
            if (detail.unitPrice !== undefined &&
                detail.quantity !== undefined &&
                detail.discount !== undefined &&
                detail.taxPercentage !== undefined &&
                detail.total !== undefined) {
                const lineSubtotal = Number(detail.quantity) * Number(detail.unitPrice);
                const lineDiscount = Number(detail.discount);
                const lineTaxes = ((lineSubtotal - lineDiscount) * Number(detail.taxPercentage || 0)) / 100;
                const expectedTotal = lineSubtotal - lineDiscount + lineTaxes;
                if (Math.abs(Number(detail.total) - expectedTotal) > 0.01) {
                    throw new Error("total must equal quantity * unitPrice - discount + tax percentage");
                }
            }
        },
    },
});
sales_model_1.Sale.hasMany(SaleDetail, {
    foreignKey: "saleId",
    as: "saleDetails",
});
SaleDetail.belongsTo(sales_model_1.Sale, {
    foreignKey: "saleId",
    as: "sale",
});
products_model_1.Product.hasMany(SaleDetail, {
    foreignKey: "productId",
    as: "saleDetails",
});
SaleDetail.belongsTo(products_model_1.Product, {
    foreignKey: "productId",
    as: "product",
});
serialized_units_model_1.SerializedUnit.hasOne(SaleDetail, {
    foreignKey: "serializedUnitId",
    as: "saleDetail",
});
SaleDetail.belongsTo(serialized_units_model_1.SerializedUnit, {
    foreignKey: "serializedUnitId",
    as: "serializedUnit",
});
exports.default = SaleDetail;
//# sourceMappingURL=sale-details.model.js.map