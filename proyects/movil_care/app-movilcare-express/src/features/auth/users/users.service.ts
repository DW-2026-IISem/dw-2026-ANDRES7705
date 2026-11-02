import { sequelize } from "../../../databases/db";
import { User } from "./user.model";
import { usersRepository } from "./users.repository";

export class UsersServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "UsersServiceError";
  }
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
  status?: "active" | "inactive";
  roleIds: number[];
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, "roleIds">> & {
  roleIds?: number[];
};

function serializeUser(user: User): Record<string, unknown> {
  const data = user.get({ plain: true }) as Record<string, unknown>;
  const assignments = Array.isArray(data.role_users) ? data.role_users : [];
  const roles = assignments.flatMap((value) => {
    if (typeof value !== "object" || value === null || !("role" in value)) {
      return [];
    }
    const role = value.role;
    if (typeof role !== "object" || role === null) {
      return [];
    }
    const { id, name, description } = role as {
      id: number;
      name: string;
      description: string | null;
    };
    return [{ id, name, description }];
  });

  delete data.password;
  delete data.role_users;
  return { ...data, roles };
}

function validateRoleIds(roleIds: number[]): void {
  if (
    !Array.isArray(roleIds) ||
    roleIds.length === 0 ||
    roleIds.some((id) => !Number.isSafeInteger(id) || id < 1) ||
    new Set(roleIds).size !== roleIds.length
  ) {
    throw new UsersServiceError(
      "roleIds debe contener identificadores positivos y únicos de al menos un rol.",
      400
    );
  }
}

async function assignRoles(
  userId: number,
  roleIds: number[],
  transaction: Parameters<typeof usersRepository.replaceRoles>[2]
): Promise<void> {
  validateRoleIds(roleIds);
  const roles = await usersRepository.findActiveRoles(roleIds, transaction);
  if (roles.length !== roleIds.length) {
    throw new UsersServiceError("Uno o más roles no existen o están inactivos.", 400);
  }
  await usersRepository.replaceRoles(userId, roleIds, transaction);
}

export const usersService = {
  async list(limit: number, offset: number) {
    const result = await usersRepository.list(limit, offset);
    return {
      items: result.rows.map(serializeUser),
      total: result.count,
      limit,
      offset,
    };
  },

  async getById(id: number) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new UsersServiceError("Usuario no encontrado.", 404);
    }
    return serializeUser(user);
  },

  async create(input: CreateUserInput) {
    return sequelize.transaction(async (transaction) => {
      const user = await usersRepository.create(
        {
          username: input.username,
          email: input.email,
          password: input.password,
          avatar: input.avatar,
          status: input.status ?? "active",
        },
        transaction
      );
      await assignRoles(user.id, input.roleIds, transaction);
      const created = await usersRepository.findById(user.id, transaction);
      if (!created) {
        throw new Error("No se pudo recuperar el usuario recién creado.");
      }
      return serializeUser(created);
    });
  },

  async update(id: number, input: UpdateUserInput) {
    return sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(id, { transaction });
      if (!user) {
        throw new UsersServiceError("Usuario no encontrado.", 404);
      }

      const { roleIds, ...values } = input;
      if (Object.keys(values).length > 0) {
        await usersRepository.update(user, values, transaction);
      }
      if (roleIds !== undefined) {
        await assignRoles(user.id, roleIds, transaction);
      }

      const updated = await usersRepository.findById(id, transaction);
      if (!updated) {
        throw new Error("No se pudo recuperar el usuario actualizado.");
      }
      return serializeUser(updated);
    });
  },

  async deactivate(id: number) {
    return sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(id, { transaction });
      if (!user) {
        throw new UsersServiceError("Usuario no encontrado.", 404);
      }
      await usersRepository.deactivate(user, transaction);
      const deactivated = await usersRepository.findById(id, transaction);
      if (!deactivated) {
        throw new Error("No se pudo recuperar el usuario desactivado.");
      }
      return serializeUser(deactivated);
    });
  },
};
