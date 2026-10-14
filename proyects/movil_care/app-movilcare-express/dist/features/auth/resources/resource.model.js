"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const resource_match_1 = require("../../../shared/auth/resource-match");
class Resource extends sequelize_1.Model {
}
exports.Resource = Resource;
Resource.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    method: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isIn: [["GET", "POST", "PUT", "PATCH", "DELETE"]],
        },
    },
    path: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
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
    modelName: "Resource",
    tableName: "resources",
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: "uq_resources_method_path",
            unique: true,
            fields: ["method", "path"],
        },
    ],
    hooks: {
        beforeValidate: (resource) => {
            if (resource.method) {
                resource.method = resource.method.trim().toUpperCase();
            }
            if (resource.path) {
                resource.path = (0, resource_match_1.normalizePath)(resource.path);
            }
        },
    },
});
//# sourceMappingURL=resource.model.js.map