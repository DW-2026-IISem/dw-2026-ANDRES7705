"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sale = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const customers_model_1 = require("../customers/customers.model");
const employees_model_1 = require("../employees/employees.model");
class Sale extends sequelize_1.Model {
}
exports.Sale = Sale;
Sale.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: "number is required" },
        },
    },
    customerId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: customers_model_1.Customer,
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        validate: {
            notNull: { msg: "customerId is required" },
        },
    },
    sellerId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: employees_model_1.Employee,
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    soldAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: { msg: "soldAt is required" },
        },
    },
    subtotal: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    taxes: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    total: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    discount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    state: {
        type: sequelize_1.DataTypes.ENUM("DRAFT", "CONFIRMED", "PAID", "CANCELLED"),
        allowNull: false,
        defaultValue: "DRAFT",
        validate: {
            isIn: {
                args: [["DRAFT", "CONFIRMED", "PAID", "CANCELLED"]],
                msg: "state must be one of DRAFT, CONFIRMED, PAID, CANCELLED",
            },
        },
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "Sale",
    tableName: "sales",
    timestamps: true,
    underscored: true,
    hooks: {
        beforeValidate: (sale) => {
            if (sale.number) {
                sale.number = sale.number.trim();
            }
            if (sale.subtotal !== undefined &&
                sale.discount !== undefined &&
                sale.taxes !== undefined &&
                sale.total !== undefined) {
                const expectedTotal = Number(sale.subtotal) - Number(sale.discount) + Number(sale.taxes);
                if (Math.abs(Number(sale.total) - expectedTotal) > 0.01) {
                    throw new Error("total must equal subtotal - discount + taxes");
                }
            }
        },
    },
});
customers_model_1.Customer.hasMany(Sale, {
    foreignKey: "customerId",
    as: "sales",
});
Sale.belongsTo(customers_model_1.Customer, {
    foreignKey: "customerId",
    as: "customer",
});
employees_model_1.Employee.hasMany(Sale, {
    foreignKey: "sellerId",
    as: "sales",
});
Sale.belongsTo(employees_model_1.Employee, {
    foreignKey: "sellerId",
    as: "seller",
});
exports.default = Sale;
//# sourceMappingURL=sales.model.js.map