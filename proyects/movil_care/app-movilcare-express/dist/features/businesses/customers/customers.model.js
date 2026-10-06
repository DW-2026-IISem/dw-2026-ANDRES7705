"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
class Customer extends sequelize_1.Model {
}
exports.Customer = Customer;
Customer.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    documentType: {
        type: sequelize_1.DataTypes.ENUM("CC", "CE", "NIT", "PASSPORT", "TI"),
        allowNull: false,
    },
    documentNumber: { type: sequelize_1.DataTypes.STRING(30), allowNull: false },
    firstName: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
    lastName: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
    companyName: { type: sequelize_1.DataTypes.STRING(150), allowNull: true },
    phone: { type: sequelize_1.DataTypes.STRING(20), allowNull: true },
    email: {
        type: sequelize_1.DataTypes.STRING(120),
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
    },
    address: { type: sequelize_1.DataTypes.STRING(200), allowNull: true },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
    sequelize: db_1.sequelize,
    modelName: "Customer",
    tableName: "customers",
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ["document_type", "document_number"],
        },
    ],
});
//# sourceMappingURL=customers.model.js.map