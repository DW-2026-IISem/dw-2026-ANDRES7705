import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";
import { normalizePath } from "../../../shared/auth/resource-match";

export class Resource extends Model {
  declare id: number;
  declare method: string;
  declare path: string;
  declare description: string | null;
  declare status: "active" | "inactive";
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Resource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [["GET", "POST", "PUT", "PATCH", "DELETE"]],
      },
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "inactive",
    },
  },
  {
    sequelize,
    modelName: "Resource",
    tableName: "resources",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: "uq_resources_method_path",
        unique: true,
        fields: ["method", "path"],
      },
    ],
    hooks: {
      beforeValidate: (resource: Resource) => {
        if (resource.method) {
          resource.method = resource.method.trim().toUpperCase();
        }
        if (resource.path) {
          resource.path = normalizePath(resource.path);
        }
      },
    },
  }
);
