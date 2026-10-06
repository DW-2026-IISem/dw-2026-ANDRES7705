import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";

export class Product extends Model {
  declare id: number;
  declare sku: string;
  declare name: string;
  declare description: string | null;
  declare type: "EQUIPMENT" | "ACCESSORY";
  declare brand: string | null;
  declare model: string | null;
  declare requiresSerial: boolean;
  declare cost: string | null;
  declare price: string;
  declare taxPercentage: string;
  declare defaultWarrantyMonths: number;
  declare isActive: boolean;
}

Product.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    sku: { type: DataTypes.STRING(40), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    type: { type: DataTypes.ENUM("EQUIPMENT", "ACCESSORY"), allowNull: false },
    brand: { type: DataTypes.STRING(80), allowNull: true },
    model: { type: DataTypes.STRING(80), allowNull: true },
    requiresSerial: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: { min: 0 },
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    taxPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    defaultWarrantyMonths: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
    underscored: true,
  }
);
