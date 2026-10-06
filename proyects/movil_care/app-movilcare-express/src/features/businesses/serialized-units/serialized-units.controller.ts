import { Request, Response } from "express";
import { Op, ValidationError, UniqueConstraintError } from "sequelize";
import { SerializedUnit } from "./serialized-units.model";

const VALID_STATES = ["IN_STOCK", "SOLD", "IN_SERVICE", "RETIRED"] as const;
const STATE_FIELD = "state";
const ALLOWED_FIELD_SET = new Set([
  "productId",
  "serial",
  "secondarySerial",
  "state",
  "receivedAt",
  "isActive",
]);

function parsePositiveInteger(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseNonNegativeInteger(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateBodyShape(body: unknown, required: readonly string[]): Record<string, unknown> | undefined {
  if (!isRecord(body)) return undefined;
  const keys = Object.keys(body);
  if (keys.length === 0 || keys.some((key) => !ALLOWED_FIELD_SET.has(key))) {
    return undefined;
  }
  if (required.some((field) => !Object.prototype.hasOwnProperty.call(body, field))) {
    return undefined;
  }
  return body;
}

function hasValidValues(body: Record<string, unknown>): boolean {
  return Object.entries(body).every(([field, value]) => {
    switch (field) {
      case "productId":
        return typeof value === "number" && Number.isInteger(value) && value > 0;
      case "serial":
      case "secondarySerial":
        return typeof value === "string" && value.trim().length > 0;
      case "state":
        return typeof value === "string" && VALID_STATES.includes(value as typeof VALID_STATES[number]);
      case "receivedAt":
        return value === null || typeof value === "string" || value instanceof Date;
      case "isActive":
        return typeof value === "boolean";
      default:
        return false;
    }
  });
}

function sendError(res: Response, error: unknown, operation: string): void {
  if (error instanceof UniqueConstraintError) {
    res.status(409).json({ error: "A record with these unique values already exists" });
    return;
  }
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: "Validation failed",
      details: error.errors.map(({ path, message }) => ({ field: path, message })),
    });
    return;
  }
  console.error(`Unexpected error while ${operation}:`, error);
  res.status(500).json({ error: "Internal server error" });
}

function buildAllowedStateError(current: string): { error: string; currentState: string } {
  return {
    error: "State transition is not allowed",
    currentState: current,
  };
}

export const serializedUnitsController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit === undefined ? 20 : parsePositiveInteger(req.query.limit as string);
    const offset = req.query.offset === undefined ? 0 : parseNonNegativeInteger(req.query.offset as string);
    const productId = req.query.productId === undefined ? undefined : parsePositiveInteger(req.query.productId as string);
    const state = typeof req.query.state === "string" ? req.query.state : undefined;

    if (
      limit === undefined ||
      limit < 1 ||
      limit > 100 ||
      offset === undefined ||
      offset < 0 ||
      (productId !== undefined && productId < 1) ||
      (state !== undefined && !VALID_STATES.includes(state as typeof VALID_STATES[number]))
    ) {
      res.status(400).json({
        error: "Invalid query. Use positive integer productId and valid state values: IN_STOCK, SOLD, IN_SERVICE, RETIRED.",
      });
      return;
    }

    try {
      const where: Record<string, unknown> = {};
      if (productId !== undefined) where.productId = productId;
      if (state !== undefined) where.state = state;

      const result = await SerializedUnit.findAndCountAll({
        where,
        limit,
        offset,
        order: [["id", "DESC"]],
      });

      res.status(200).json({ items: result.rows, total: result.count, limit, offset });
    } catch (error) {
      sendError(res, error, "listing serialized units");
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = parsePositiveInteger(req.params.id);
    if (id === undefined) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }

    try {
      const record = await SerializedUnit.findByPk(id);
      if (!record) {
        res.status(404).json({ error: "Record not found" });
        return;
      }
      res.status(200).json(record);
    } catch (error) {
      sendError(res, error, "retrieving a serialized unit");
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const body = validateBodyShape(req.body, ["productId", "serial", "state"]);
    if (!body || !hasValidValues(body)) {
      res.status(400).json({ error: "Invalid body, missing required fields, or unsupported fields" });
      return;
    }

    try {
      const created = await SerializedUnit.create({
        ...body,
        secondarySerial: body.secondarySerial ?? null,
        receivedAt: body.receivedAt ?? null,
      });
      res.status(201).json(created);
    } catch (error) {
      sendError(res, error, "creating a serialized unit");
    }
  },

  replace: async (req: Request, res: Response): Promise<void> => {
    const id = parsePositiveInteger(req.params.id);
    const body = validateBodyShape(req.body, ["productId", "serial", "state"]);

    if (id === undefined || !body || !hasValidValues(body)) {
      res.status(400).json({ error: "Invalid replacement body or unsupported fields" });
      return;
    }

    try {
      const record = await SerializedUnit.findByPk(id);
      if (!record) {
        res.status(404).json({ error: "Record not found" });
        return;
      }

      const replacement = {
        productId: body.productId,
        serial: body.serial,
        secondarySerial: body.secondarySerial ?? null,
        state: body.state,
        receivedAt: body.receivedAt ?? null,
        isActive: body.isActive ?? true,
      };

      record.set(replacement);
      await record.save();
      res.status(200).json(record);
    } catch (error) {
      sendError(res, error, "replacing a serialized unit");
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const id = parsePositiveInteger(req.params.id);
    const body = validateBodyShape(req.body, []);

    if (id === undefined || !body) {
      res.status(400).json({ error: "Invalid patch body or unsupported fields" });
      return;
    }

    if (Object.prototype.hasOwnProperty.call(body, STATE_FIELD)) {
      res.status(400).json({
        error: "State changes must be done with the dedicated sale/service endpoints.",
      });
      return;
    }

    if (!hasValidValues(body)) {
      res.status(400).json({ error: "Invalid patch body or unsupported fields" });
      return;
    }

    try {
      const record = await SerializedUnit.findByPk(id);
      if (!record) {
        res.status(404).json({ error: "Record not found" });
        return;
      }

      record.set(body);
      await record.save();
      res.status(200).json(record);
    } catch (error) {
      sendError(res, error, "updating a serialized unit");
    }
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    const id = parsePositiveInteger(req.params.id);
    if (id === undefined) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }

    try {
      const record = await SerializedUnit.findByPk(id);
      if (!record) {
        res.status(404).json({ error: "Record not found" });
        return;
      }

      record.set({ isActive: false });
      await record.save({ fields: ["isActive"] });
      res.status(200).json(record);
    } catch (error) {
      sendError(res, error, "deleting a serialized unit");
    }
  },

  sell: async (req: Request, res: Response): Promise<void> => {
    const id = parsePositiveInteger(req.params.id);
    if (id === undefined) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }

    try {
      const record = await SerializedUnit.findByPk(id);
      if (!record) {
        res.status(404).json({ error: "Record not found" });
        return;
      }

      if (record.state !== "IN_STOCK") {
        res.status(409).json(buildAllowedStateError(record.state));
        return;
      }

      record.set({ state: "SOLD" });
      await record.save({ fields: [STATE_FIELD] });
      res.status(200).json(record);
    } catch (error) {
      sendError(res, error, "selling a serialized unit");
    }
  },

  service: async (req: Request, res: Response): Promise<void> => {
    const id = parsePositiveInteger(req.params.id);
    if (id === undefined) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }

    try {
      const record = await SerializedUnit.findByPk(id);
      if (!record) {
        res.status(404).json({ error: "Record not found" });
        return;
      }

      const validTransitions: Record<string, string> = {
        IN_STOCK: "IN_SERVICE",
        IN_SERVICE: "IN_STOCK",
      };

      const nextState = validTransitions[record.state];
      if (!nextState) {
        res.status(409).json(buildAllowedStateError(record.state));
        return;
      }

      record.set({ state: nextState });
      await record.save({ fields: [STATE_FIELD] });
      res.status(200).json(record);
    } catch (error) {
      sendError(res, error, "updating the service state of a serialized unit");
    }
  },
};

export default serializedUnitsController;
