"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparePart = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
class SparePart extends sequelize_1.Model {
}
exports.SparePart = SparePart;
SparePart.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    sku: { type: sequelize_1.DataTypes.STRING(40), allowNull: false, unique: true },
    name: { type: sequelize_1.DataTypes.STRING(150), allowNull: false },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    compatibility: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    cost: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: { min: 0 },
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: { min: 0 },
    },
    currentStock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    minimumStock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
    sequelize: db_1.sequelize,
    modelName: "SparePart",
    tableName: "spare_parts",
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=spare-parts.model.js.map