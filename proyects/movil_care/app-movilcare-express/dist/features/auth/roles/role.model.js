"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
class Role extends sequelize_1.Model {
}
exports.Role = Role;
Role.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(80),
        allowNull: false,
        unique: "uq_roles_name",
        validate: {
            notEmpty: true,
        },
    },
    description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "inactive",
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
    underscored: true,
    hooks: {
        beforeValidate: (role) => {
            if (role.name)
                role.name = role.name.trim().toUpperCase();
        },
    },
});
//# sourceMappingURL=role.model.js.map