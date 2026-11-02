import { Request, Response } from "express";
import { UniqueConstraintError, ValidationError } from "sequelize";
import { Role } from "./role.model";

function parseBody(body: unknown): {
  name: string;
  description: string | null;
  status: "active" | "inactive";
} | undefined {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return undefined;
  }

  const data = body as Record<string, unknown>;
  const allowed = new Set(["name", "description", "status"]);

  if (
    Object.keys(data).length === 0 ||
    Object.keys(data).some((key) => !allowed.has(key)) ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0 ||
    data.name.trim().length > 80 ||
    (data.description !== undefined &&
      data.description !== null &&
      (typeof data.description !== "string" || data.description.length > 255)) ||
    (data.status !== undefined &&
      data.status !== "active" &&
      data.status !== "inactive")
  ) {
    return undefined;
  }

  return {
    name: data.name.trim(),
    description: (data.description as string | null | undefined) ?? null,
    status: (data.status as "active" | "inactive" | undefined) ?? "active",
  };
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof UniqueConstraintError) {
    res.status(409).json({ error: "Ya existe un rol con ese nombre." });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({
      error: "Los datos del rol no son válidos.",
      details: error.errors.map(({ path, message }) => ({
        field: path,
        message,
      })),
    });
    return;
  }

  console.error("Error en roles:", error);
  res.status(500).json({ error: "Error interno del servidor." });
}

export const rolesController = {
  list: async (_req: Request, res: Response): Promise<void> => {
    try {
      const roles = await Role.findAll({ order: [["id", "ASC"]] });
      res.status(200).json(roles);
    } catch (error) {
      handleError(res, error);
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }

    try {
      const role = await Role.findByPk(id);

      if (!role) {
        res.status(404).json({ error: "Rol no encontrado." });
        return;
      }

      res.status(200).json(role);
    } catch (error) {
      handleError(res, error);
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const body = parseBody(req.body);

    if (!body) {
      res.status(400).json({
        error: "Cuerpo inválido. Envía name y, opcionalmente, description y status.",
      });
      return;
    }

    try {
      const role = await Role.create(body);
      res.status(201).json(role);
    } catch (error) {
      handleError(res, error);
    }
  },
};
