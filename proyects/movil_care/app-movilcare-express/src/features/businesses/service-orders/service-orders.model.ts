import { DataTypes, Model, ValidationError } from "sequelize";
import { sequelize } from "../../../databases/db";
import { Customer } from "../customers/customers.model";
import { Employee } from "../employees/employees.model";
import { SerializedUnit } from "../serialized-units/serialized-units.model";
import { Warranty } from "../warranties/warranties.model";

export const SERVICE_TYPES = ["COMMERCIAL_WARRANTY", "PAID_REPAIR", "RECURRENCE"] as const;
export const SERVICE_ORDER_STATES = [
  "RECEIVED",
  "DIAGNOSING",
  "AWAITING_AUTHORIZATION",
  "IN_REPAIR",
  "READY",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
] as const;

export class ServiceOrder extends Model {
  declare id: number;
  declare number: string;
  declare customerId: number;
  declare serializedUnitId: number;
  declare technicianId: number | null;
  declare serviceType: (typeof SERVICE_TYPES)[number];
  declare warrantyId: number | null;
  declare originOrderId: number | null;
  declare reportedIssue: string;
  declare intakeCondition: string | null;
  declare receivedAccessories: string | null;
  declare openedAt: Date;
  declare estimatedDeliveryDate: Date | null;
  declare closedAt: Date | null;
  declare total: string;
  declare state: (typeof SERVICE_ORDER_STATES)[number];
}

ServiceOrder.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: "number is required" } },
    },
    customerId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: Customer, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: { notNull: { msg: "customerId is required" } },
    },
    serializedUnitId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: SerializedUnit, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: { notNull: { msg: "serializedUnitId is required" } },
    },
    technicianId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: Employee, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    serviceType: {
      type: DataTypes.ENUM(...SERVICE_TYPES),
      allowNull: false,
      validate: { notNull: { msg: "serviceType is required" } },
    },
    warrantyId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: Warranty, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    originOrderId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "service_orders", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    reportedIssue: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: "reportedIssue is required" } },
    },
    intakeCondition: { type: DataTypes.TEXT, allowNull: true },
    receivedAccessories: { type: DataTypes.STRING(255), allowNull: true },
    openedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: { notNull: { msg: "openedAt is required" } },
    },
    estimatedDeliveryDate: { type: DataTypes.DATE, allowNull: true },
    closedAt: { type: DataTypes.DATE, allowNull: true },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    state: {
      type: DataTypes.ENUM(...SERVICE_ORDER_STATES),
      allowNull: false,
      defaultValue: "RECEIVED",
    },
  },
  {
    sequelize,
    modelName: "ServiceOrder",
    tableName: "service_orders",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (order) => {
        if (order.number) order.number = order.number.trim();
        if (order.serviceType === "RECURRENCE" && !order.originOrderId) {
          throw new ValidationError("originOrderId is required for a recurrence", []);
        }
        if (order.serviceType === "COMMERCIAL_WARRANTY" && !order.warrantyId) {
          throw new ValidationError("warrantyId is required for a commercial warranty order", []);
        }
        if (
          order.openedAt instanceof Date &&
          order.closedAt instanceof Date &&
          order.closedAt.getTime() < order.openedAt.getTime()
        ) {
          throw new ValidationError("closedAt cannot be earlier than openedAt", []);
        }
      },
    },
  }
);

Customer.hasMany(ServiceOrder, { foreignKey: "customerId", as: "serviceOrders" });
ServiceOrder.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
SerializedUnit.hasMany(ServiceOrder, { foreignKey: "serializedUnitId", as: "serviceOrders" });
ServiceOrder.belongsTo(SerializedUnit, { foreignKey: "serializedUnitId", as: "serializedUnit" });
Employee.hasMany(ServiceOrder, { foreignKey: "technicianId", as: "serviceOrders" });
ServiceOrder.belongsTo(Employee, { foreignKey: "technicianId", as: "technician" });
Warranty.hasMany(ServiceOrder, { foreignKey: "warrantyId", as: "serviceOrders" });
ServiceOrder.belongsTo(Warranty, { foreignKey: "warrantyId", as: "warranty" });
ServiceOrder.hasMany(ServiceOrder, { foreignKey: "originOrderId", as: "recurrences" });
ServiceOrder.belongsTo(ServiceOrder, { foreignKey: "originOrderId", as: "originOrder" });

export default ServiceOrder;
