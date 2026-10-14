"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.PAYMENT_STATUSES = exports.PAYMENT_METHODS = exports.PAYMENT_REFERENCE_TYPES = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
exports.PAYMENT_REFERENCE_TYPES = ["SALE", "SERVICE_ORDER"];
exports.PAYMENT_METHODS = ["CASH", "CARD", "TRANSFER", "OTHER"];
exports.PAYMENT_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"];
class Payment extends sequelize_1.Model {
}
exports.Payment = Payment;
Payment.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    referenceType: {
        type: sequelize_1.DataTypes.ENUM(...exports.PAYMENT_REFERENCE_TYPES),
        allowNull: false,
        validate: {
            isIn: {
                args: [[...exports.PAYMENT_REFERENCE_TYPES]],
                msg: "referenceType must be SALE or SERVICE_ORDER",
            },
        },
    },
    referenceId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 1,
            isInt: true,
        },
    },
    method: {
        type: sequelize_1.DataTypes.ENUM(...exports.PAYMENT_METHODS),
        allowNull: false,
        validate: {
            isIn: {
                args: [[...exports.PAYMENT_METHODS]],
                msg: "Invalid payment method",
            },
        },
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: 0.01,
        },
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...exports.PAYMENT_STATUSES),
        allowNull: false,
        defaultValue: "COMPLETED",
        validate: {
            isIn: {
                args: [[...exports.PAYMENT_STATUSES]],
                msg: "Invalid payment status",
            },
        },
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
    underscored: true,
});
exports.default = Payment;
//# sourceMappingURL=payments.model.js.map