"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const password_1 = require("../../../shared/auth/password");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(80),
        allowNull: false,
        unique: "uq_users_username",
        validate: {
            notEmpty: true,
            len: [3, 80],
        },
    },
    email: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false,
        unique: "uq_users_email",
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    avatar: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "inactive",
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
    hooks: {
        beforeValidate: (user) => {
            if (user.username)
                user.username = user.username.trim().toLowerCase();
            if (user.email)
                user.email = user.email.trim().toLowerCase();
        },
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await (0, password_1.hashPassword)(user.password);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed("password") && user.password) {
                user.password = await (0, password_1.hashPassword)(user.password);
            }
        },
        beforeBulkCreate: async (users) => {
            for (const user of users) {
                if (user.password) {
                    user.password = await (0, password_1.hashPassword)(user.password);
                }
            }
        },
    },
});
//# sourceMappingURL=user.model.js.map