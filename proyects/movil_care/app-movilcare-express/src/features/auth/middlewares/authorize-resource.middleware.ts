import { NextFunction, Request, Response } from "express";
import { Role } from "../roles/role.model";
import { RoleUser } from "../role-users/role-user.model";
import { Resource } from "../resources/resource.model";
import { ResourceRole } from "../resource-roles/resource-role.model";
import { User } from "../users/user.model";
import { resourcePathMatches } from "../../../shared/auth/resource-match";

export async function authorizeResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({
        message: "Debes autenticarte para acceder a este recurso.",
      });
      return;
    }

    const user = await User.findOne({
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

    const activeRoleAssignments = await RoleUser.findAll({
      where: {
        user_id: user.id,
        status: "active",
      },
      include: [
        {
          model: Role,
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

    const activeResourceAssignments = await ResourceRole.findAll({
      where: {
        role_id: roleIds,
        status: "active",
      },
      include: [
        {
          model: Resource,
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
      const resource = assignment.get("resource") as Resource | undefined;

      return Boolean(
        resource &&
        resourcePathMatches(requestPath, resource.path)
      );
    });

    if (!allowed) {
      res.status(403).json({
        message: "No tienes permisos para acceder a este recurso.",
      });
      return;
    }

    next();
  } catch (error: unknown) {
    console.error(
      "Error al comprobar permisos RBAC:",
      error instanceof Error ? error.message : error
    );

    res.status(500).json({
      message: "No se pudieron verificar los permisos del usuario.",
    });
  }
}
