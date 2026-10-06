import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";
import { Product } from "../products/products.model";

export class SerializedUnit extends Model {
  declare id: number;
  declare productId: number;
  declare serial: string;
  declare secondarySerial: string | null;
  declare state: "IN_STOCK" | "SOLD" | "IN_SERVICE" | "RETIRED";
  declare receivedAt: Date | null;
  declare isActive: boolean;
}

SerializedUnit.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: {
        notNull: { msg: "productId is required" },
      },
    },
    serial: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "serial is required" },
      },
    },
    secondarySerial: {
      type: DataTypes.STRING(80),
      allowNull: true,
      unique: true,
      validate: {
        notEmpty: { msg: "secondarySerial cannot be empty" },
      },
    },
    state: {
      type: DataTypes.ENUM("IN_STOCK", "SOLD", "IN_SERVICE", "RETIRED"),
      allowNull: false,
      defaultValue: "IN_STOCK",
      validate: {
        isIn: {
          args: [["IN_STOCK", "SOLD", "IN_SERVICE", "RETIRED"]],
          msg: "state must be one of IN_STOCK, SOLD, IN_SERVICE, RETIRED",
        },
      },
    },
    receivedAt: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: "SerializedUnit",
    tableName: "serialized_units",
    timestamps: true,
    underscored: true,
  }
);

Product.hasMany(SerializedUnit, {
  foreignKey: "productId",
  as: "serializedUnits",
});

SerializedUnit.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

export default SerializedUnit;
