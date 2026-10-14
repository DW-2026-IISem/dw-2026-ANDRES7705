"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceRole = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
class ResourceRole extends sequelize_1.Model {
}
exports.ResourceRole = ResourceRole;
ResourceRole.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    resource_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "inactive",
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "ResourceRole",
    tableName: "resource_roles",
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: "uq_resource_roles_role_resource",
            unique: true,
            fields: ["role_id", "resource_id"],
        },
        { name: "ix_resource_roles_role_id", fields: ["role_id"] },
        { name: "ix_resource_roles_resource_id", fields: ["resource_id"] },
    ],
});
//# sourceMappingURL=resource-role.model.js.map