import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";

export class Customer extends Model {
  declare id: number;
  declare documentType: "CC" | "CE" | "NIT" | "PASSPORT" | "TI";
  declare documentNumber: string;
  declare firstName: string;
  declare lastName: string | null;
  declare companyName: string | null;
  declare phone: string | null;
  declare email: string | null;
  declare address: string | null;
  declare isActive: boolean;
}

Customer.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    documentType: {
      type: DataTypes.ENUM("CC", "CE", "NIT", "PASSPORT", "TI"),
      allowNull: false,
    },
    documentNumber: { type: DataTypes.STRING(30), allowNull: false },
    firstName: { type: DataTypes.STRING(100), allowNull: false },
    lastName: { type: DataTypes.STRING(100), allowNull: true },
    companyName: { type: DataTypes.STRING(150), allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    email: {
      type: DataTypes.STRING(120),
      allowNull: true,
      unique: true,
      validate: { isEmail: true },
    },
    address: { type: DataTypes.STRING(200), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Customer",
    tableName: "customers",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["document_type", "document_number"],
      },
    ],
  }
);
