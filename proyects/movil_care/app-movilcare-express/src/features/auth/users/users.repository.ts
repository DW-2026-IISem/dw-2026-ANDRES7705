import { FindOptions, Transaction } from "sequelize";
import { Role } from "../roles/role.model";
import { RoleUser } from "../role-users/role-user.model";
import { User } from "./user.model";

const userAssociations = [
  {
    model: RoleUser,
    as: "role_users",
    required: false,
    where: { status: "active" },
    attributes: ["role_id", "status"],
    include: [
      {
        model: Role,
        as: "role",
        required: false,
        attributes: ["id", "name", "description"],
      },
    ],
  },
];

const safeUserAttributes = [
  "id",
  "username",
  "email",
  "avatar",
  "status",
  "createdAt",
  "updatedAt",
];

export const usersRepository = {
  list(limit: number, offset: number) {
    return User.findAndCountAll({
      attributes: safeUserAttributes,
      include: userAssociations,
      limit,
      offset,
      distinct: true,
      order: [["id", "ASC"]],
    });
  },

  findById(id: number, transaction?: Transaction) {
    return User.findByPk(id, {
      attributes: safeUserAttributes,
      include: userAssociations,
      transaction,
    });
  },

  create(
    values: {
      username: string;
      email: string;
      password: string;
      avatar?: string | null;
      status: "active" | "inactive";
    },
    transaction: Transaction
  ) {
    return User.create(values, { transaction });
  },

  update(user: User, values: Partial<User>, transaction: Transaction) {
    return user.update(values, { transaction });
  },

  async replaceRoles(
    userId: number,
    roleIds: number[],
    transaction: Transaction
  ): Promise<void> {
    const existing = await RoleUser.findAll({
      where: { user_id: userId },
      transaction,
    });
    const desired = new Set(roleIds);

    for (const assignment of existing) {
      const shouldBeActive = desired.has(assignment.role_id);
      if (shouldBeActive && assignment.status !== "active") {
        await assignment.update({ status: "active" }, { transaction });
      } else if (!shouldBeActive && assignment.status !== "inactive") {
        await assignment.update({ status: "inactive" }, { transaction });
      }
      desired.delete(assignment.role_id);
    }

    if (desired.size > 0) {
      await RoleUser.bulkCreate(
        [...desired].map((role_id) => ({
          user_id: userId,
          role_id,
          status: "active" as const,
        })),
        { transaction }
      );
    }
  },

  async findActiveRoles(roleIds: number[], transaction: Transaction): Promise<Role[]> {
    const options: FindOptions = {
      where: { id: roleIds, status: "active" },
      transaction,
    };
    return Role.findAll(options);
  },

  deactivate(user: User, transaction: Transaction) {
    return user.update({ status: "inactive" }, { transaction });
  },
};
