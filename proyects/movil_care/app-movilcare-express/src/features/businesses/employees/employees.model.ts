import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";

export class Employee extends Model {
  declare id: number;
  declare name: string;
  declare document: string | null;
  declare role: "SELLER" | "TECHNICIAN" | "ADMIN";
  declare email: string | null;
  declare isActive: boolean;
}

Employee.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    document: { type: DataTypes.STRING(30), allowNull: true, unique: true },
    role: {
      type: DataTypes.ENUM("SELLER", "TECHNICIAN", "ADMIN"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: true,
      unique: true,
      validate: { isEmail: true },
    },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
    timestamps: true,
    underscored: true,
  }
);
