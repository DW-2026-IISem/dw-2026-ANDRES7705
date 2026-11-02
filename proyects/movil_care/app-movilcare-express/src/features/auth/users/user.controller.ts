import { Request, Response } from "express";
import {
  CreateUserInput,
  UpdateUserInput,
  UsersServiceError,
  usersService,
} from "./users.service";
import { UniqueConstraintError, ValidationError } from "sequelize";

const createFields = new Set([
  "username",
  "email",
  "password",
  "avatar",
  "status",
  "roleIds",
]);
const updateFields = new Set([
  "username",
  "email",
  "password",
  "avatar",
  "status",
  "roleIds",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveInteger(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function paginationValue(value: unknown, fallback: number): number | undefined {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function isRoleIds(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((id) => typeof id === "number");
}

function isUserBody(
  body: unknown,
  fields: Set<string>,
  requireCreateFields: boolean
): body is Record<string, unknown> {
  if (!isRecord(body)) return false;
  const keys = Object.keys(body);
  if (keys.length === 0 || keys.some((key) => !fields.has(key))) return false;

  if (requireCreateFields) {
    if (!["username", "email", "password", "roleIds"].every((key) => key in body)) {
      return false;
    }
  }

  if ("username" in body && (typeof body.username !== "string" || body.username.trim().length < 3 || body.username.trim().length > 80)) {
    return false;
  }
  if ("email" in body && (typeof body.email !== "string" || body.email.trim().length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))) {
    return false;
  }
  if ("password" in body && (typeof body.password !== "string" || body.password.length < 8)) {
    return false;
  }
  if ("avatar" in body && body.avatar !== null && (typeof body.avatar !== "string" || body.avatar.length > 500)) {
    return false;
  }
  if ("status" in body && body.status !== "active" && body.status !== "inactive") {
    return false;
  }
  if ("roleIds" in body && !isRoleIds(body.roleIds)) {
    return false;
  }

  return true;
}

function toCreateInput(body: Record<string, unknown>): CreateUserInput {
  return {
    username: body.username as string,
    email: body.email as string,
    password: body.password as string,
    avatar: body.avatar as string | null | undefined,
    status: body.status as "active" | "inactive" | undefined,
    roleIds: body.roleIds as number[],
  };
}

function toUpdateInput(body: Record<string, unknown>): UpdateUserInput {
  return body as UpdateUserInput;
}

function sendError(res: Response, error: unknown, operation: string): void {
  if (error instanceof UsersServiceError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  if (error instanceof UniqueConstraintError) {
    res.status(409).json({ error: "El nombre de usuario o correo ya está registrado." });
    return;
  }
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: "Los datos del usuario no son válidos.",
      details: error.errors.map(({ path, message }) => ({ field: path, message })),
    });
    return;
  }
  console.error(`Error al ${operation} usuario:`, error);
  res.status(500).json({ error: "Error interno del servidor." });
}

export const userController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const limit = paginationValue(req.query.limit, 20);
    const offset = paginationValue(req.query.offset, 0);
    if (limit === undefined || limit < 1 || limit > 100 || offset === undefined) {
      res.status(400).json({ error: "limit debe estar entre 1 y 100 y offset debe ser un entero no negativo." });
      return;
    }
    try {
      res.status(200).json(await usersService.list(limit, offset));
    } catch (error) {
      sendError(res, error, "listar");
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = positiveInteger(req.params.id);
    if (id === undefined) {
      res.status(400).json({ error: "id debe ser un entero positivo." });
      return;
    }
    try {
      res.status(200).json(await usersService.getById(id));
    } catch (error) {
      sendError(res, error, "consultar");
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    if (!isUserBody(req.body, createFields, true)) {
      res.status(400).json({ error: "Cuerpo inválido o campos requeridos/permitidos incorrectos." });
      return;
    }
    try {
      res.status(201).json(await usersService.create(toCreateInput(req.body)));
    } catch (error) {
      sendError(res, error, "crear");
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const id = positiveInteger(req.params.id);
    if (id === undefined) {
      res.status(400).json({ error: "id debe ser un entero positivo." });
      return;
    }
    if (!isUserBody(req.body, updateFields, false)) {
      res.status(400).json({ error: "Cuerpo de actualización inválido o sin campos editables." });
      return;
    }
    try {
      res.status(200).json(await usersService.update(id, toUpdateInput(req.body)));
    } catch (error) {
      sendError(res, error, "actualizar");
    }
  },

  deactivate: async (req: Request, res: Response): Promise<void> => {
    const id = positiveInteger(req.params.id);
    if (id === undefined) {
      res.status(400).json({ error: "id debe ser un entero positivo." });
      return;
    }
    try {
      res.status(200).json(await usersService.deactivate(id));
    } catch (error) {
      sendError(res, error, "desactivar");
    }
  },
};
