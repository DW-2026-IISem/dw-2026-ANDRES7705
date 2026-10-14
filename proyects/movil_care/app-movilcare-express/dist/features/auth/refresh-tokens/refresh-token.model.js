"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
class RefreshToken extends sequelize_1.Model {
}
exports.RefreshToken = RefreshToken;
RefreshToken.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    token_hash: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: "uq_refresh_tokens_token_hash",
    },
    family_id: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    device_info: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    expires_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "RefreshToken",
    tableName: "refresh_tokens",
    timestamps: true,
    underscored: true,
    indexes: [
        { name: "ix_refresh_tokens_family_id", fields: ["family_id"] },
        { name: "ix_refresh_tokens_user_id", fields: ["user_id"] },
    ],
});
//# sourceMappingURL=refresh-token.model.js.map