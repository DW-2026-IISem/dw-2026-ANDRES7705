
import { Request, Response } from "express";
import { ResourceRole } from "./resource-role.model";

export const grantResourceToRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const roleId = Number(req.body.role_id);
    const resourceId = Number(req.body.resource_id);

    if (
      !Number.isInteger(roleId) ||
      roleId <= 0 ||
      !Number.isInteger(resourceId) ||
      resourceId <= 0
    ) {
      res.status(400).json({
        message: "role_id y resource_id deben ser números enteros positivos.",
      });
      return;
    }

    const existing = await ResourceRole.findOne({
      where: {
        role_id: roleId,
        resource_id: resourceId,
      },
    });

    if (existing) {
      if (existing.status === "active") {
        res.status(409).json({
          message: "Este recurso ya está asignado y activo para el rol.",
        });
        return;
      }

      await existing.update({ status: "active" });

      res.status(200).json({
        message: "Permiso reactivado correctamente.",
        data: existing,
      });
      return;
    }

    const assignment = await ResourceRole.create({
      role_id: roleId,
      resource_id: resourceId,
      status: "active",
    });

    res.status(201).json({
      message: "Permiso asignado correctamente.",
      data: assignment,
    });
  } catch (error) {
    console.error("Error al asignar recurso al rol:", error);

    res.status(500).json({
      message: "No se pudo asignar el recurso al rol.",
    });
  }
};
