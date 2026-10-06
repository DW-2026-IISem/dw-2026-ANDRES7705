"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warranty = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const sale_details_model_1 = require("../sale-details/sale-details.model");
const serialized_units_model_1 = require("../serialized-units/serialized-units.model");
class Warranty extends sequelize_1.Model {
}
exports.Warranty = Warranty;
Warranty.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    saleDetailId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: sale_details_model_1.SaleDetail,
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: {
            notNull: { msg: "saleDetailId is required" },
        },
    },
    serializedUnitId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: serialized_units_model_1.SerializedUnit,
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    type: {
        type: sequelize_1.DataTypes.ENUM("COMMERCIAL", "EXTENDED", "SUPPLIER"),
        allowNull: false,
        validate: {
            isIn: {
                args: [["COMMERCIAL", "EXTENDED", "SUPPLIER"]],
                msg: "type must be one of COMMERCIAL, EXTENDED, SUPPLIER",
            },
        },
    },
    coverageDescription: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: { msg: "startDate is required" },
        },
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: { msg: "endDate is required" },
        },
    },
    state: {
        type: sequelize_1.DataTypes.ENUM("VALID", "EXPIRED", "CANCELLED", "CONSUMED"),
        allowNull: false,
        defaultValue: "VALID",
        validate: {
            isIn: {
                args: [["VALID", "EXPIRED", "CANCELLED", "CONSUMED"]],
                msg: "state must be one of VALID, EXPIRED, CANCELLED, CONSUMED",
            },
        },
    },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
    sequelize: db_1.sequelize,
    modelName: "Warranty",
    tableName: "warranties",
    timestamps: true,
    underscored: true,
    hooks: {
        beforeValidate: (warranty) => {
            if (warranty.startDate instanceof Date &&
                warranty.endDate instanceof Date &&
                warranty.endDate.getTime() < warranty.startDate.getTime()) {
                throw new sequelize_1.ValidationError("endDate must be equal to or later than startDate", []);
            }
        },
    },
});
sale_details_model_1.SaleDetail.hasMany(Warranty, {
    foreignKey: "saleDetailId",
    as: "warranties",
});
Warranty.belongsTo(sale_details_model_1.SaleDetail, {
    foreignKey: "saleDetailId",
    as: "saleDetail",
});
serialized_units_model_1.SerializedUnit.hasMany(Warranty, {
    foreignKey: "serializedUnitId",
    as: "warranties",
});
Warranty.belongsTo(serialized_units_model_1.SerializedUnit, {
    foreignKey: "serializedUnitId",
    as: "serializedUnit",
});
exports.default = Warranty;
//# sourceMappingURL=warranties.model.js.map