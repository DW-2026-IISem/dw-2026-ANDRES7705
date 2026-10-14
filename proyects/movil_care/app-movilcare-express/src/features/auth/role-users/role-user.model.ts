import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";

export class RoleUser extends Model {
  declare id: number;
  declare user_id: number;
  declare role_id: number;
  declare status: "active" | "inactive";
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

RoleUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "inactive",
    },
  },
  {
    sequelize,
    modelName: "RoleUser",
    tableName: "role_users",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: "uq_role_users_user_role",
        unique: true,
        fields: ["user_id", "role_id"],
      },
      { name: "ix_role_users_user_id", fields: ["user_id"] },
      { name: "ix_role_users_role_id", fields: ["role_id"] },
    ],
  }
);
