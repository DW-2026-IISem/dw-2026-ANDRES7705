"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceAuthorization = exports.AUTHORIZATION_CHANNELS = exports.AUTHORIZATION_STATES = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const employees_model_1 = require("../employees/employees.model");
const diagnostics_model_1 = require("./diagnostics.model");
exports.AUTHORIZATION_STATES = ["PENDING", "APPROVED", "REJECTED"];
exports.AUTHORIZATION_CHANNELS = [
    "IN_PERSON",
    "PHONE",
    "WHATSAPP",
    "EMAIL",
    "DIGITAL_SIGNATURE",
];
class ServiceAuthorization extends sequelize_1.Model {
}
exports.ServiceAuthorization = ServiceAuthorization;
ServiceAuthorization.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    diagnosticId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: { model: diagnostics_model_1.Diagnostic, key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: { notNull: { msg: "diagnosticId is required" } },
    },
    state: {
        type: sequelize_1.DataTypes.ENUM(...exports.AUTHORIZATION_STATES),
        allowNull: false,
        validate: { notNull: { msg: "state is required" } },
    },
    authorizedAmount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    channel: {
        type: sequelize_1.DataTypes.ENUM(...exports.AUTHORIZATION_CHANNELS),
        allowNull: false,
        validate: { notNull: { msg: "channel is required" } },
    },
    respondedAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    notes: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    recordedBy: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
        references: { model: employees_model_1.Employee, key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "ServiceAuthorization",
    tableName: "service_authorizations",
    timestamps: true,
    underscored: true,
});
diagnostics_model_1.Diagnostic.hasMany(ServiceAuthorization, {
    foreignKey: "diagnosticId",
    as: "authorizations",
});
ServiceAuthorization.belongsTo(diagnostics_model_1.Diagnostic, {
    foreignKey: "diagnosticId",
    as: "diagnostic",
});
employees_model_1.Employee.hasMany(ServiceAuthorization, {
    foreignKey: "recordedBy",
    as: "serviceAuthorizations",
});
ServiceAuthorization.belongsTo(employees_model_1.Employee, {
    foreignKey: "recordedBy",
    as: "recorder",
});
exports.default = ServiceAuthorization;
//# sourceMappingURL=service-authorizations.model.js.map