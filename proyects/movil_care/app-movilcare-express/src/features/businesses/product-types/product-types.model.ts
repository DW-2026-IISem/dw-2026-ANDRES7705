import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";

export type ProductTypeStatus = "active" | "inactive";

export interface ProductTypeAttributes {
  id?: number;
  name: string;
  description?: string | null;
  status?: ProductTypeStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductType
  extends Model<ProductTypeAttributes, Omit<ProductTypeAttributes, "id">>
  implements ProductTypeAttributes
{
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare status: ProductTypeStatus;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ProductType.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "inactive",
    },
  },
  {
    sequelize,
    modelName: "ProductType",
    tableName: "product_types",
    timestamps: true,
    underscored: true,
  }
);
