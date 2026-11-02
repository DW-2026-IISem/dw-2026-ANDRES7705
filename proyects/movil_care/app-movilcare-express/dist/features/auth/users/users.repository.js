"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRepository = void 0;
const role_model_1 = require("../roles/role.model");
const role_user_model_1 = require("../role-users/role-user.model");
const user_model_1 = require("./user.model");
const userAssociations = [
    {
        model: role_user_model_1.RoleUser,
        as: "role_users",
        required: false,
        where: { status: "active" },
        attributes: ["role_id", "status"],
        include: [
            {
                model: role_model_1.Role,
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
exports.usersRepository = {
    list(limit, offset) {
        return user_model_1.User.findAndCountAll({
            attributes: safeUserAttributes,
            include: userAssociations,
            limit,
            offset,
            distinct: true,
            order: [["id", "ASC"]],
        });
    },
    findById(id, transaction) {
        return user_model_1.User.findByPk(id, {
            attributes: safeUserAttributes,
            include: userAssociations,
            transaction,
        });
    },
    create(values, transaction) {
        return user_model_1.User.create(values, { transaction });
    },
    update(user, values, transaction) {
        return user.update(values, { transaction });
    },
    async replaceRoles(userId, roleIds, transaction) {
        const existing = await role_user_model_1.RoleUser.findAll({
            where: { user_id: userId },
            transaction,
        });
        const desired = new Set(roleIds);
        for (const assignment of existing) {
            const shouldBeActive = desired.has(assignment.role_id);
            if (shouldBeActive && assignment.status !== "active") {
                await assignment.update({ status: "active" }, { transaction });
            }
            else if (!shouldBeActive && assignment.status !== "inactive") {
                await assignment.update({ status: "inactive" }, { transaction });
            }
            desired.delete(assignment.role_id);
        }
        if (desired.size > 0) {
            await role_user_model_1.RoleUser.bulkCreate([...desired].map((role_id) => ({
                user_id: userId,
                role_id,
                status: "active",
            })), { transaction });
        }
    },
    async findActiveRoles(roleIds, transaction) {
        const options = {
            where: { id: roleIds, status: "active" },
            transaction,
        };
        return role_model_1.Role.findAll(options);
    },
    deactivate(user, transaction) {
        return user.update({ status: "inactive" }, { transaction });
    },
};
//# sourceMappingURL=users.repository.js.map