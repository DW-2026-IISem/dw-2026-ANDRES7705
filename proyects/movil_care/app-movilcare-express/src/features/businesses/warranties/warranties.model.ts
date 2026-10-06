import { DataTypes, Model, ValidationError } from "sequelize";
import { sequelize } from "../../../databases/db";
import { SaleDetail } from "../sale-details/sale-details.model";
import { SerializedUnit } from "../serialized-units/serialized-units.model";

export class Warranty extends Model {
  declare id: number;
  declare saleDetailId: number;
  declare serializedUnitId: number | null;
  declare type: "COMMERCIAL" | "EXTENDED" | "SUPPLIER";
  declare coverageDescription: string | null;
  declare startDate: Date;
  declare endDate: Date;
  declare state: "VALID" | "EXPIRED" | "CANCELLED" | "CONSUMED";
  declare isActive: boolean;
}

Warranty.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    saleDetailId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: SaleDetail,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: {
        notNull: { msg: "saleDetailId is required" },
      },
    },
    serializedUnitId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: SerializedUnit,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    type: {
      type: DataTypes.ENUM("COMMERCIAL", "EXTENDED", "SUPPLIER"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["COMMERCIAL", "EXTENDED", "SUPPLIER"]],
          msg: "type must be one of COMMERCIAL, EXTENDED, SUPPLIER",
        },
      },
    },
    coverageDescription: { type: DataTypes.TEXT, allowNull: true },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: "startDate is required" },
      },
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: "endDate is required" },
      },
    },
    state: {
      type: DataTypes.ENUM("VALID", "EXPIRED", "CANCELLED", "CONSUMED"),
      allowNull: false,
      defaultValue: "VALID",
      validate: {
        isIn: {
          args: [["VALID", "EXPIRED", "CANCELLED", "CONSUMED"]],
          msg: "state must be one of VALID, EXPIRED, CANCELLED, CONSUMED",
        },
      },
    },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Warranty",
    tableName: "warranties",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (warranty) => {
        if (
          warranty.startDate instanceof Date &&
          warranty.endDate instanceof Date &&
          warranty.endDate.getTime() < warranty.startDate.getTime()
        ) {
          throw new ValidationError(
            "endDate must be equal to or later than startDate",
            []
          );
        }
      },
    },
  }
);

SaleDetail.hasMany(Warranty, {
  foreignKey: "saleDetailId",
  as: "warranties",
});

Warranty.belongsTo(SaleDetail, {
  foreignKey: "saleDetailId",
  as: "saleDetail",
});

SerializedUnit.hasMany(Warranty, {
  foreignKey: "serializedUnitId",
  as: "warranties",
});

Warranty.belongsTo(SerializedUnit, {
  foreignKey: "serializedUnitId",
  as: "serializedUnit",
});

export default Warranty;
