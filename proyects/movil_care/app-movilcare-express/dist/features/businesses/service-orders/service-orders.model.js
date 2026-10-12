"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOrder = exports.SERVICE_ORDER_STATES = exports.SERVICE_TYPES = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const customers_model_1 = require("../customers/customers.model");
const employees_model_1 = require("../employees/employees.model");
const serialized_units_model_1 = require("../serialized-units/serialized-units.model");
const warranties_model_1 = require("../warranties/warranties.model");
exports.SERVICE_TYPES = ["COMMERCIAL_WARRANTY", "PAID_REPAIR", "RECURRENCE"];
exports.SERVICE_ORDER_STATES = [
    "RECEIVED",
    "DIAGNOSING",
    "AWAITING_AUTHORIZATION",
    "IN_REPAIR",
    "READY",
    "DELIVERED",
    "REJECTED",
    "CANCELLED",
];
class ServiceOrder extends sequelize_1.Model {
}
exports.ServiceOrder = ServiceOrder;
ServiceOrder.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: { notEmpty: { msg: "number is required" } },
    },
    customerId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: { model: customers_model_1.Customer, key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: { notNull: { msg: "customerId is required" } },
    },
    serializedUnitId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: { model: serialized_units_model_1.SerializedUnit, key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: { notNull: { msg: "serializedUnitId is required" } },
    },
    technicianId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
        references: { model: employees_model_1.Employee, key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    serviceType: {
        type: sequelize_1.DataTypes.ENUM(...exports.SERVICE_TYPES),
        allowNull: false,
        validate: { notNull: { msg: "serviceType is required" } },
    },
    warrantyId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
        references: { model: warranties_model_1.Warranty, key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    originOrderId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
        references: { model: "service_orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    reportedIssue: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: { msg: "reportedIssue is required" } },
    },
    intakeCondition: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    receivedAccessories: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    openedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: { notNull: { msg: "openedAt is required" } },
    },
    estimatedDeliveryDate: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    closedAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    total: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    state: {
        type: sequelize_1.DataTypes.ENUM(...exports.SERVICE_ORDER_STATES),
        allowNull: false,
        defaultValue: "RECEIVED",
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "ServiceOrder",
    tableName: "service_orders",
    timestamps: true,
    underscored: true,
    hooks: {
        beforeValidate: (order) => {
            if (order.number)
                order.number = order.number.trim();
            if (order.serviceType === "RECURRENCE" && !order.originOrderId) {
                throw new sequelize_1.ValidationError("originOrderId is required for a recurrence", []);
            }
            if (order.serviceType === "COMMERCIAL_WARRANTY" && !order.warrantyId) {
                throw new sequelize_1.ValidationError("warrantyId is required for a commercial warranty order", []);
            }
            if (order.openedAt instanceof Date &&
                order.closedAt instanceof Date &&
                order.closedAt.getTime() < order.openedAt.getTime()) {
                throw new sequelize_1.ValidationError("closedAt cannot be earlier than openedAt", []);
            }
        },
    },
});
customers_model_1.Customer.hasMany(ServiceOrder, { foreignKey: "customerId", as: "serviceOrders" });
ServiceOrder.belongsTo(customers_model_1.Customer, { foreignKey: "customerId", as: "customer" });
serialized_units_model_1.SerializedUnit.hasMany(ServiceOrder, { foreignKey: "serializedUnitId", as: "serviceOrders" });
ServiceOrder.belongsTo(serialized_units_model_1.SerializedUnit, { foreignKey: "serializedUnitId", as: "serializedUnit" });
employees_model_1.Employee.hasMany(ServiceOrder, { foreignKey: "technicianId", as: "serviceOrders" });
ServiceOrder.belongsTo(employees_model_1.Employee, { foreignKey: "technicianId", as: "technician" });
warranties_model_1.Warranty.hasMany(ServiceOrder, { foreignKey: "warrantyId", as: "serviceOrders" });
ServiceOrder.belongsTo(warranties_model_1.Warranty, { foreignKey: "warrantyId", as: "warranty" });
ServiceOrder.hasMany(ServiceOrder, { foreignKey: "originOrderId", as: "recurrences" });
ServiceOrder.belongsTo(ServiceOrder, { foreignKey: "originOrderId", as: "originOrder" });
exports.default = ServiceOrder;
//# sourceMappingURL=service-orders.model.js.map