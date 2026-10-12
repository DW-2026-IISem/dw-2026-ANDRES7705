"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagnostic = exports.DIAGNOSTIC_CAUSES = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const employees_model_1 = require("../employees/employees.model");
const service_orders_model_1 = require("./service-orders.model");
exports.DIAGNOSTIC_CAUSES = [
    "FACTORY_DEFECT",
    "WEAR",
    "MISUSE",
    "MOISTURE",
    "IMPACT",
    "OTHER",
];
class Diagnostic extends sequelize_1.Model {
}
exports.Diagnostic = Diagnostic;
Diagnostic.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    serviceOrderId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: { model: service_orders_model_1.ServiceOrder, key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: { notNull: { msg: "serviceOrderId is required" } },
    },
    technicianId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: { model: employees_model_1.Employee, key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: { notNull: { msg: "technicianId is required" } },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: { msg: "description is required" } },
    },
    cause: {
        type: sequelize_1.DataTypes.ENUM(...exports.DIAGNOSTIC_CAUSES),
        allowNull: false,
    },
    warrantyCovered: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: true },
    laborCost: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    estimatedTotal: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    diagnosedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: { notNull: { msg: "diagnosedAt is required" } },
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "Diagnostic",
    tableName: "diagnostics",
    timestamps: true,
    underscored: true,
    hooks: {
        afterSave: async (diagnostic, options) => {
            if (diagnostic.warrantyCovered === true) {
                await service_orders_model_1.ServiceOrder.update({ total: 0 }, {
                    where: {
                        id: diagnostic.serviceOrderId,
                        serviceType: "COMMERCIAL_WARRANTY",
                    },
                    transaction: options.transaction,
                });
            }
        },
    },
});
service_orders_model_1.ServiceOrder.hasMany(Diagnostic, { foreignKey: "serviceOrderId", as: "diagnostics" });
Diagnostic.belongsTo(service_orders_model_1.ServiceOrder, { foreignKey: "serviceOrderId", as: "serviceOrder" });
employees_model_1.Employee.hasMany(Diagnostic, { foreignKey: "technicianId", as: "diagnostics" });
Diagnostic.belongsTo(employees_model_1.Employee, { foreignKey: "technicianId", as: "technician" });
exports.default = Diagnostic;
//# sourceMappingURL=diagnostics.model.js.map