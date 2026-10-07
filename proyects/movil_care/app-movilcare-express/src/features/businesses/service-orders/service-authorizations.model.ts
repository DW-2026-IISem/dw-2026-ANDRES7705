import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";
import { Employee } from "../employees/employees.model";
import { Diagnostic } from "./diagnostics.model";

export const AUTHORIZATION_STATES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const AUTHORIZATION_CHANNELS = [
  "IN_PERSON",
  "PHONE",
  "WHATSAPP",
  "EMAIL",
  "DIGITAL_SIGNATURE",
] as const;

export class ServiceAuthorization extends Model {
  declare id: number;
  declare diagnosticId: number;
  declare state: (typeof AUTHORIZATION_STATES)[number];
  declare authorizedAmount: string;
  declare channel: (typeof AUTHORIZATION_CHANNELS)[number];
  declare respondedAt: Date | null;
  declare notes: string | null;
  declare recordedBy: number | null;
}

ServiceAuthorization.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    diagnosticId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: Diagnostic, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: { notNull: { msg: "diagnosticId is required" } },
    },
    state: {
      type: DataTypes.ENUM(...AUTHORIZATION_STATES),
      allowNull: false,
      validate: { notNull: { msg: "state is required" } },
    },
    authorizedAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    channel: {
      type: DataTypes.ENUM(...AUTHORIZATION_CHANNELS),
      allowNull: false,
      validate: { notNull: { msg: "channel is required" } },
    },
    respondedAt: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.STRING(255), allowNull: true },
    recordedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: Employee, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
  },
  {
    sequelize,
    modelName: "ServiceAuthorization",
    tableName: "service_authorizations",
    timestamps: true,
    underscored: true,
  }
);

Diagnostic.hasMany(ServiceAuthorization, {
  foreignKey: "diagnosticId",
  as: "authorizations",
});
ServiceAuthorization.belongsTo(Diagnostic, {
  foreignKey: "diagnosticId",
  as: "diagnostic",
});
Employee.hasMany(ServiceAuthorization, {
  foreignKey: "recordedBy",
  as: "serviceAuthorizations",
});
ServiceAuthorization.belongsTo(Employee, {
  foreignKey: "recordedBy",
  as: "recorder",
});

export default ServiceAuthorization;
