"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeResource = authorizeResource;
const role_model_1 = require("../roles/role.model");
const role_user_model_1 = require("../role-users/role-user.model");
const resource_model_1 = require("../resources/resource.model");
const resource_role_model_1 = require("../resource-roles/resource-role.model");
const user_model_1 = require("../users/user.model");
const resource_match_1 = require("../../../shared/auth/resource-match");
async function authorizeResource(req, res, next) {
    try {
        if (!req.auth) {
            res.status(401).json({
                message: "Debes autenticarte para acceder a este recurso.",
            });
            return;
        }
        const user = await user_model_1.User.findOne({
            where: {
                id: req.auth.userId,
                status: "active",
            },
            attributes: ["id"],
        });
        if (!user) {
            res.status(401).json({
                message: "El usuario no existe o está inactivo.",
            });
            return;
        }
        const activeRoleAssignments = await role_user_model_1.RoleUser.findAll({
            where: {
                user_id: user.id,
                status: "active",
            },
            include: [
                {
                    model: role_model_1.Role,
                    as: "role",
                    required: true,
                    where: { status: "active" },
                    attributes: ["id", "name"],
                },
            ],
        });
        const roleIds = activeRoleAssignments
            .map((assignment) => assignment.role_id);
        if (roleIds.length === 0) {
            res.status(403).json({
                message: "El usuario no tiene roles activos.",
            });
            return;
        }
        const activeResourceAssignments = await resource_role_model_1.ResourceRole.findAll({
            where: {
                role_id: roleIds,
                status: "active",
            },
            include: [
                {
                    model: resource_model_1.Resource,
                    as: "resource",
                    required: true,
                    where: {
                        method: req.method.toUpperCase(),
                        status: "active",
                    },
                    attributes: ["id", "method", "path"],
                },
            ],
        });
        const requestPath = req.path;
        const allowed = activeResourceAssignments.some((assignment) => {
            const resource = assignment.get("resource");
            return Boolean(resource &&
                (0, resource_match_1.resourcePathMatches)(requestPath, resource.path));
        });
        if (!allowed) {
            res.status(403).json({
                message: "No tienes permisos para acceder a este recurso.",
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Error al comprobar permisos RBAC:", error instanceof Error ? error.message : error);
        res.status(500).json({
            message: "No se pudieron verificar los permisos del usuario.",
        });
    }
}
//# sourceMappingURL=authorize-resource.middleware.js.map