"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = exports.UsersServiceError = void 0;
const db_1 = require("../../../databases/db");
const user_model_1 = require("./user.model");
const users_repository_1 = require("./users.repository");
class UsersServiceError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "UsersServiceError";
    }
}
exports.UsersServiceError = UsersServiceError;
function serializeUser(user) {
    const data = user.get({ plain: true });
    const assignments = Array.isArray(data.role_users) ? data.role_users : [];
    const roles = assignments.flatMap((value) => {
        if (typeof value !== "object" || value === null || !("role" in value)) {
            return [];
        }
        const role = value.role;
        if (typeof role !== "object" || role === null) {
            return [];
        }
        const { id, name, description } = role;
        return [{ id, name, description }];
    });
    delete data.password;
    delete data.role_users;
    return { ...data, roles };
}
function validateRoleIds(roleIds) {
    if (!Array.isArray(roleIds) ||
        roleIds.length === 0 ||
        roleIds.some((id) => !Number.isSafeInteger(id) || id < 1) ||
        new Set(roleIds).size !== roleIds.length) {
        throw new UsersServiceError("roleIds debe contener identificadores positivos y únicos de al menos un rol.", 400);
    }
}
async function assignRoles(userId, roleIds, transaction) {
    validateRoleIds(roleIds);
    const roles = await users_repository_1.usersRepository.findActiveRoles(roleIds, transaction);
    if (roles.length !== roleIds.length) {
        throw new UsersServiceError("Uno o más roles no existen o están inactivos.", 400);
    }
    await users_repository_1.usersRepository.replaceRoles(userId, roleIds, transaction);
}
exports.usersService = {
    async list(limit, offset) {
        const result = await users_repository_1.usersRepository.list(limit, offset);
        return {
            items: result.rows.map(serializeUser),
            total: result.count,
            limit,
            offset,
        };
    },
    async getById(id) {
        const user = await users_repository_1.usersRepository.findById(id);
        if (!user) {
            throw new UsersServiceError("Usuario no encontrado.", 404);
        }
        return serializeUser(user);
    },
    async create(input) {
        return db_1.sequelize.transaction(async (transaction) => {
            const user = await users_repository_1.usersRepository.create({
                username: input.username,
                email: input.email,
                password: input.password,
                avatar: input.avatar,
                status: input.status ?? "active",
            }, transaction);
            await assignRoles(user.id, input.roleIds, transaction);
            const created = await users_repository_1.usersRepository.findById(user.id, transaction);
            if (!created) {
                throw new Error("No se pudo recuperar el usuario recién creado.");
            }
            return serializeUser(created);
        });
    },
    async update(id, input) {
        return db_1.sequelize.transaction(async (transaction) => {
            const user = await user_model_1.User.findByPk(id, { transaction });
            if (!user) {
                throw new UsersServiceError("Usuario no encontrado.", 404);
            }
            const { roleIds, ...values } = input;
            if (Object.keys(values).length > 0) {
                await users_repository_1.usersRepository.update(user, values, transaction);
            }
            if (roleIds !== undefined) {
                await assignRoles(user.id, roleIds, transaction);
            }
            const updated = await users_repository_1.usersRepository.findById(id, transaction);
            if (!updated) {
                throw new Error("No se pudo recuperar el usuario actualizado.");
            }
            return serializeUser(updated);
        });
    },
    async deactivate(id) {
        return db_1.sequelize.transaction(async (transaction) => {
            const user = await user_model_1.User.findByPk(id, { transaction });
            if (!user) {
                throw new UsersServiceError("Usuario no encontrado.", 404);
            }
            await users_repository_1.usersRepository.deactivate(user, transaction);
            const deactivated = await users_repository_1.usersRepository.findById(id, transaction);
            if (!deactivated) {
                throw new Error("No se pudo recuperar el usuario desactivado.");
            }
            return serializeUser(deactivated);
        });
    },
};
//# sourceMappingURL=users.service.js.map