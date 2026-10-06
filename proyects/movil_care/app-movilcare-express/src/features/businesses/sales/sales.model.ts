import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";
import { Customer } from "../customers/customers.model";
import { Employee } from "../employees/employees.model";

export class Sale extends Model {
  declare id: number;
  declare number: string;
  declare customerId: number;
  declare sellerId: number | null;
  declare soldAt: Date;
  declare subtotal: string;
  declare taxes: string;
  declare total: string;
  declare discount: string;
  declare state: "DRAFT" | "CONFIRMED" | "PAID" | "CANCELLED";
}

Sale.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "number is required" },
      },
    },
    customerId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Customer,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: {
        notNull: { msg: "customerId is required" },
      },
    },
    sellerId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: Employee,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    soldAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: "soldAt is required" },
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    taxes: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    state: {
      type: DataTypes.ENUM("DRAFT", "CONFIRMED", "PAID", "CANCELLED"),
      allowNull: false,
      defaultValue: "DRAFT",
      validate: {
        isIn: {
          args: [["DRAFT", "CONFIRMED", "PAID", "CANCELLED"]],
          msg: "state must be one of DRAFT, CONFIRMED, PAID, CANCELLED",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "Sale",
    tableName: "sales",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (sale) => {
        if (sale.number) {
          sale.number = sale.number.trim();
        }

        if (
          sale.subtotal !== undefined &&
          sale.discount !== undefined &&
          sale.taxes !== undefined &&
          sale.total !== undefined
        ) {
          const expectedTotal =
            Number(sale.subtotal) - Number(sale.discount) + Number(sale.taxes);
          if (Math.abs(Number(sale.total) - expectedTotal) > 0.01) {
            throw new Error("total must equal subtotal - discount + taxes");
          }
        }
      },
    },
  }
);

Customer.hasMany(Sale, {
  foreignKey: "customerId",
  as: "sales",
});

Sale.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});

Employee.hasMany(Sale, {
  foreignKey: "sellerId",
  as: "sales",
});

Sale.belongsTo(Employee, {
  foreignKey: "sellerId",
  as: "seller",
});

export default Sale;
