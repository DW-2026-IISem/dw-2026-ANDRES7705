import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";
import { Employee } from "../employees/employees.model";
import { ServiceOrder } from "./service-orders.model";

export const DIAGNOSTIC_CAUSES = [
  "FACTORY_DEFECT",
  "WEAR",
  "MISUSE",
  "MOISTURE",
  "IMPACT",
  "OTHER",
] as const;

export class Diagnostic extends Model {
  declare id: number;
  declare serviceOrderId: number;
  declare technicianId: number;
  declare description: string;
  declare cause: (typeof DIAGNOSTIC_CAUSES)[number];
  declare warrantyCovered: boolean | null;
  declare laborCost: string;
  declare estimatedTotal: string;
  declare diagnosedAt: Date;
}

Diagnostic.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    serviceOrderId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: ServiceOrder, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: { notNull: { msg: "serviceOrderId is required" } },
    },
    technicianId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: Employee, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: { notNull: { msg: "technicianId is required" } },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: "description is required" } },
    },
    cause: {
      type: DataTypes.ENUM(...DIAGNOSTIC_CAUSES),
      allowNull: false,
    },
    warrantyCovered: { type: DataTypes.BOOLEAN, allowNull: true },
    laborCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    estimatedTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    diagnosedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: { notNull: { msg: "diagnosedAt is required" } },
    },
  },
  {
    sequelize,
    modelName: "Diagnostic",
    tableName: "diagnostics",
    timestamps: true,
    underscored: true,
    hooks: {
      afterSave: async (diagnostic, options) => {
        if (diagnostic.warrantyCovered === true) {
          await ServiceOrder.update(
            { total: 0 },
            {
              where: {
                id: diagnostic.serviceOrderId,
                serviceType: "COMMERCIAL_WARRANTY",
              },
              transaction: options.transaction,
            }
          );
        }
      },
    },
  }
);

ServiceOrder.hasMany(Diagnostic, { foreignKey: "serviceOrderId", as: "diagnostics" });
Diagnostic.belongsTo(ServiceOrder, { foreignKey: "serviceOrderId", as: "serviceOrder" });
Employee.hasMany(Diagnostic, { foreignKey: "technicianId", as: "diagnostics" });
Diagnostic.belongsTo(Employee, { foreignKey: "technicianId", as: "technician" });

export default Diagnostic;
