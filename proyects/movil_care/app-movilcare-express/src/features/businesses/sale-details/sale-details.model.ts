import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";
import { Product } from "../products/products.model";
import { Sale } from "../sales/sales.model";
import { SerializedUnit } from "../serialized-units/serialized-units.model";

export class SaleDetail extends Model {
  declare id: number;
  declare saleId: number;
  declare productId: number;
  declare serializedUnitId: number | null;
  declare quantity: number;
  declare unitPrice: string;
  declare discount: string;
  declare taxPercentage: string | null;
  declare total: string;
  declare notes: string | null;
}

SaleDetail.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    saleId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Sale,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: {
        notNull: { msg: "saleId is required" },
      },
    },
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
    serializedUnitId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: true,
      references: {
        model: SerializedUnit,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: "quantity must be greater than 0" },
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    taxPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
      validate: { min: 0 },
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "SaleDetail",
    tableName: "sale_details",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (detail) => {
        if (detail.serializedUnitId !== null && detail.serializedUnitId !== undefined) {
          if (detail.quantity !== 1) {
            throw new Error("quantity must be 1 when a serialized unit is assigned");
          }
        }

        if (
          detail.unitPrice !== undefined &&
          detail.quantity !== undefined &&
          detail.discount !== undefined &&
          detail.taxPercentage !== undefined &&
          detail.total !== undefined
        ) {
          const lineSubtotal = Number(detail.quantity) * Number(detail.unitPrice);
          const lineDiscount = Number(detail.discount);
          const lineTaxes =
            ((lineSubtotal - lineDiscount) * Number(detail.taxPercentage || 0)) / 100;
          const expectedTotal = lineSubtotal - lineDiscount + lineTaxes;
          if (Math.abs(Number(detail.total) - expectedTotal) > 0.01) {
            throw new Error(
              "total must equal quantity * unitPrice - discount + tax percentage"
            );
          }
        }
      },
    },
  }
);

Sale.hasMany(SaleDetail, {
  foreignKey: "saleId",
  as: "saleDetails",
});

SaleDetail.belongsTo(Sale, {
  foreignKey: "saleId",
  as: "sale",
});

Product.hasMany(SaleDetail, {
  foreignKey: "productId",
  as: "saleDetails",
});

SaleDetail.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

SerializedUnit.hasOne(SaleDetail, {
  foreignKey: "serializedUnitId",
  as: "saleDetail",
});

SaleDetail.belongsTo(SerializedUnit, {
  foreignKey: "serializedUnitId",
  as: "serializedUnit",
});

export default SaleDetail;
