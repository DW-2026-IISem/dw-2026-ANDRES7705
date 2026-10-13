
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";

export const PAYMENT_REFERENCE_TYPES = ["SALE", "SERVICE_ORDER"] as const;
export const PAYMENT_METHODS = ["CASH", "CARD", "TRANSFER", "OTHER"] as const;
export const PAYMENT_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"] as const;

export class Payment extends Model {
  declare id: number;
  declare referenceType: (typeof PAYMENT_REFERENCE_TYPES)[number];
  declare referenceId: number;
  declare method: (typeof PAYMENT_METHODS)[number];
  declare amount: string;
  declare date: Date;
  declare status: (typeof PAYMENT_STATUSES)[number];
}

Payment.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    referenceType: {
      type: DataTypes.ENUM(...PAYMENT_REFERENCE_TYPES),
      allowNull: false,
      validate: {
        isIn: {
          args: [[...PAYMENT_REFERENCE_TYPES]],
          msg: "referenceType must be SALE or SERVICE_ORDER",
        },
      },
    },
    referenceId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 1,
        isInt: true,
      },
    },
    method: {
      type: DataTypes.ENUM(...PAYMENT_METHODS),
      allowNull: false,
      validate: {
        isIn: {
          args: [[...PAYMENT_METHODS]],
          msg: "Invalid payment method",
        },
      },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM(...PAYMENT_STATUSES),
      allowNull: false,
      defaultValue: "COMPLETED",
      validate: {
        isIn: {
          args: [[...PAYMENT_STATUSES]],
          msg: "Invalid payment status",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
    underscored: true,
  }
);

export default Payment;
