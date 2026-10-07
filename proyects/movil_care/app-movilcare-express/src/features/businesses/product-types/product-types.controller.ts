import { Request, Response } from "express";
import {
  UniqueConstraintError,
  ValidationError,
} from "sequelize";
import { ProductType, ProductTypeStatus } from "./product-types.model";

type ProductTypeBody = {
  name?: unknown;
  description?: unknown;
  status?: unknown;
};

type ParsedProductTypeBody = {
  name?: string;
  description?: string | null;
  status?: ProductTypeStatus;
};

const EDITABLE_FIELDS = new Set(["name", "description", "status"]);
const VALID_STATUSES: ProductTypeStatus[] = ["active", "inactive"];

function parseId(req: Request): number | undefined {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!/^[1-9]\d*$/.test(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : undefined;
}

function parseBody(value: unknown, requireName: boolean): ParsedProductTypeBody | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const body = value as ProductTypeBody;
  const keys = Object.keys(body);
  if (
    keys.length === 0 ||
    keys.some((key) => !EDITABLE_FIELDS.has(key)) ||
    (requireName && (typeof body.name !== "string" || body.name.trim() === "")) ||
    (body.name !== undefined &&
      (typeof body.name !== "string" || body.name.trim() === "" || body.name.length > 100)) ||
    (body.description !== undefined &&
      body.description !== null &&
      (typeof body.description !== "string" || body.description.length > 255)) ||
    (body.status !== undefined &&
      (typeof body.status !== "string" ||
        !VALID_STATUSES.includes(body.status as ProductTypeStatus)))
  ) {
    return undefined;
  }
  return body as ParsedProductTypeBody;
}

function handleError(res: Response, error: unknown, operation: string): void {
  if (error instanceof UniqueConstraintError) {
    res.status(409).json({ error: "A product type with these values already exists" });
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

export const productTypesController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100 ||
      !Number.isInteger(offset) ||
      offset < 0
    ) {
      res.status(400).json({
        error: "limit must be 1-100 and offset must be a non-negative integer",
      });
      return;
    }
    try {
      const result = await ProductType.findAndCountAll({
        where: { status: "active" },
        limit,
        offset,
        order: [["id", "ASC"]],
      });
      res.status(200).json({
        items: result.rows,
        total: result.count,
        limit,
        offset,
      });
    } catch (error) {
      handleError(res, error, "listing product types");
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req);
    if (id === undefined) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      const productType = await ProductType.findByPk(id);
      if (!productType) {
        res.status(404).json({ error: "Product type not found" });
        return;
      }
      res.status(200).json(productType);
    } catch (error) {
      handleError(res, error, "retrieving a product type");
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const body = parseBody(req.body, true);
    if (!body) {
      res.status(400).json({ error: "Invalid body or missing required name" });
      return;
    }
    try {
      const productType = await ProductType.create({
        name: body.name!.trim(),
        description: body.description === undefined ? null : body.description,
        status: body.status === undefined ? "active" : body.status,
      });
      res.status(201).json(productType);
    } catch (error) {
      handleError(res, error, "creating a product type");
    }
  },

  replace: async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req);
    const body = parseBody(req.body, true);
    if (id === undefined) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    if (!body) {
      res.status(400).json({ error: "Invalid replacement body or missing required name" });
      return;
    }
    try {
      const productType = await ProductType.findByPk(id);
      if (!productType) {
        res.status(404).json({ error: "Product type not found" });
        return;
      }
      await productType.update({
        name: body.name!.trim(),
        description: body.description === undefined ? null : body.description,
        status: body.status === undefined ? productType.status : body.status,
      });
      res.status(200).json(productType);
    } catch (error) {
      handleError(res, error, "replacing a product type");
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req);
    const body = parseBody(req.body, false);
    if (id === undefined) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    if (!body) {
      res.status(400).json({ error: "Invalid patch body or unsupported fields" });
      return;
    }
    try {
      const productType = await ProductType.findByPk(id);
      if (!productType) {
        res.status(404).json({ error: "Product type not found" });
        return;
      }
      const updates: Partial<ProductType> = {};
      if (body.name !== undefined) updates.name = body.name.trim();
      if (body.description !== undefined) {
        updates.description = body.description;
      }
      if (body.status !== undefined) updates.status = body.status;
      await productType.update(updates);
      res.status(200).json(productType);
    } catch (error) {
      handleError(res, error, "updating a product type");
    }
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req);
    if (id === undefined) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      const productType = await ProductType.findByPk(id);
      if (!productType) {
        res.status(404).json({ error: "Product type not found" });
        return;
      }
      await productType.destroy();
      res.status(200).json({ message: "Product type permanently deleted", id });
    } catch (error) {
      handleError(res, error, "deleting a product type");
    }
  },

  deactivate: async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req);
    if (id === undefined) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      const productType = await ProductType.findByPk(id);
      if (!productType) {
        res.status(404).json({ error: "Product type not found" });
        return;
      }
      await productType.update({ status: "inactive" });
      res.status(200).json({
        message: "Product type deactivated (logical delete)",
        product_type: productType,
      });
    } catch (error) {
      handleError(res, error, "deactivating a product type");
    }
  },
};
