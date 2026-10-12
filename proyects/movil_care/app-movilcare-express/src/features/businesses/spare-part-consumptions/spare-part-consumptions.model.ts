import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";
import { ServiceOrder } from "../service-orders/service-orders.model";
import { SparePart } from "../spare-parts/spare-parts.model";

export class SparePartConsumption extends Model {
  declare id: number;
  declare serviceOrderId: number;
  declare sparePartId: number;
  declare quantity: number;
  declare unitCost: string;
  declare totalCost: string;
  declare observations: string | null;
}

SparePartConsumption.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    serviceOrderId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "service_orders", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: { min: 1 },
    },
    sparePartId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "spare_parts", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: { min: 1 },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    unitCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "SparePartConsumption",
    tableName: "spare_part_consumptions",
    timestamps: true,
    underscored: true,
    validate: {
      totalMatchesQuantity() {
        const expected =
          Number(this.getDataValue("quantity")) *
          Number(this.getDataValue("unitCost"));

        if (Math.abs(Number(this.getDataValue("totalCost")) - expected) > 0.01) {
          throw new Error("totalCost must equal quantity multiplied by unitCost");
        }
      },
    },
  }
);

ServiceOrder.hasMany(SparePartConsumption, {
  foreignKey: "serviceOrderId",
  as: "sparePartConsumptions",
});

SparePartConsumption.belongsTo(ServiceOrder, {
  foreignKey: "serviceOrderId",
  as: "serviceOrder",
});

SparePart.hasMany(SparePartConsumption, {
  foreignKey: "sparePartId",
  as: "consumptions",
});

SparePartConsumption.belongsTo(SparePart, {
  foreignKey: "sparePartId",
  as: "sparePart",
});

export default SparePartConsumption;
