"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparePartConsumption = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const service_orders_model_1 = require("../service-orders/service-orders.model");
const spare_parts_model_1 = require("../spare-parts/spare-parts.model");
class SparePartConsumption extends sequelize_1.Model {
}
exports.SparePartConsumption = SparePartConsumption;
SparePartConsumption.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    serviceOrderId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: { model: "service_orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: { min: 1 },
    },
    sparePartId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: { model: "spare_parts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: { min: 1 },
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
    },
    unitCost: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    totalCost: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    observations: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "SparePartConsumption",
    tableName: "spare_part_consumptions",
    timestamps: true,
    underscored: true,
    validate: {
        totalMatchesQuantity() {
            const quantity = Number(this.getDataValue("quantity"));
            const unitCost = Number(this.getDataValue("unitCost"));
            const totalCost = Number(this.getDataValue("totalCost"));
            if (!Number.isFinite(quantity) ||
                !Number.isFinite(unitCost) ||
                !Number.isFinite(totalCost)) {
                throw new Error("Quantity and costs must be valid numbers");
            }
            if (Math.abs(totalCost - quantity * unitCost) > 0.01) {
                throw new Error("totalCost must equal quantity multiplied by unitCost");
            }
        },
    },
});
service_orders_model_1.ServiceOrder.hasMany(SparePartConsumption, {
    foreignKey: "serviceOrderId",
    as: "sparePartConsumptions",
});
SparePartConsumption.belongsTo(service_orders_model_1.ServiceOrder, {
    foreignKey: "serviceOrderId",
    as: "serviceOrder",
});
spare_parts_model_1.SparePart.hasMany(SparePartConsumption, {
    foreignKey: "sparePartId",
    as: "consumptions",
});
SparePartConsumption.belongsTo(spare_parts_model_1.SparePart, {
    foreignKey: "sparePartId",
    as: "sparePart",
});
exports.default = SparePartConsumption;
//# sourceMappingURL=spare-part-consumptions.model.js.map