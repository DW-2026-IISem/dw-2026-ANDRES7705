import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";

export class SparePart extends Model {
  declare id: number;
  declare sku: string;
  declare name: string;
  declare description: string | null;
  declare compatibility: string | null;
  declare cost: string | null;
  declare price: string | null;
  declare currentStock: number;
  declare minimumStock: number;
  declare isActive: boolean;
}

SparePart.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    sku: { type: DataTypes.STRING(40), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    compatibility: { type: DataTypes.STRING(255), allowNull: true },
    cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: { min: 0 },
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: { min: 0 },
    },
    currentStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    minimumStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: "SparePart",
    tableName: "spare_parts",
    timestamps: true,
    underscored: true,
  }
);
