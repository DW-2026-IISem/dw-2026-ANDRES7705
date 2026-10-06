"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
class Employee extends sequelize_1.Model {
}
exports.Employee = Employee;
Employee.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING(150), allowNull: false },
    document: { type: sequelize_1.DataTypes.STRING(30), allowNull: true, unique: true },
    role: {
        type: sequelize_1.DataTypes.ENUM("SELLER", "TECHNICIAN", "ADMIN"),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(120),
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
    },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
    sequelize: db_1.sequelize,
    modelName: "Employee",
    tableName: "employees",
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=employees.model.js.map