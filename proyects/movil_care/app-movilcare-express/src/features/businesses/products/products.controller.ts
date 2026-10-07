import { NextFunction, Request, Response } from "express";
import { createCrudController } from "../shared/crud.controller";
import { ProductType } from "../product-types/product-types.model";
import { Product } from "./products.model";

const crudController = createCrudController(Product, {
  fields: [
    "sku",
    "name",
    "description",
    "type",
    "productTypeId",
    "brand",
    "model",
    "requiresSerial",
    "cost",
    "price",
    "taxPercentage",
    "defaultWarrantyMonths",
    "isActive",
  ],
  requiredFields: ["sku", "name", "type", "productTypeId", "price"],
  softDeleteField: "isActive",
});

function parseProductTypeId(value: unknown): number | undefined {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    !/^[1-9]\d*$/.test(String(value))
  ) {
    return undefined;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : undefined;
}

async function validateActiveProductType(
  req: Request,
  res: Response,
  next: NextFunction,
  required: boolean
): Promise<void> {
  const body =
    typeof req.body === "object" && req.body !== null && !Array.isArray(req.body)
      ? (req.body as Record<string, unknown>)
      : {};
  const rawId = body.productTypeId;

  if (rawId === undefined && !required) {
    next();
    return;
  }

  const productTypeId = parseProductTypeId(rawId);
  if (productTypeId === undefined) {
    res.status(400).json({ error: "productTypeId must be a positive integer" });
    return;
  }

  try {
    const productType = await ProductType.findByPk(productTypeId);
    if (!productType) {
      res.status(404).json({ error: "Product type not found" });
      return;
    }
    if (productType.status !== "active") {
      res.status(400).json({ error: "Product type must be active" });
      return;
    }
    next();
  } catch (error) {
    console.error("Unexpected error while validating product type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const productsController = {
  ...crudController,
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
      const result = await Product.findAndCountAll({
        where: { isActive: true },
        include: [{ model: ProductType, as: "productType" }],
        limit,
        offset,
        order: [["id", "ASC"]],
      });
      res.status(200).json({ items: result.rows, total: result.count, limit, offset });
    } catch (error) {
      console.error("Unexpected error while listing products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getById: async (req: Request, res: Response): Promise<void> => {
    const rawId = req.params.id;
    const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      const product = await Product.findByPk(id, {
        include: [{ model: ProductType, as: "productType" }],
      });
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.status(200).json(product);
    } catch (error) {
      console.error("Unexpected error while retrieving product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  validateProductTypeForCreate: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => validateActiveProductType(req, res, next, true),
  validateProductTypeForUpdate: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => validateActiveProductType(req, res, next, false),
  deletePhysical: async (req: Request, res: Response): Promise<void> => {
    const rawId = req.params.id;
    const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      await product.destroy();
      res.status(200).json({ message: "Product permanently deleted", id });
    } catch (error) {
      if (
        error instanceof Error &&
        "name" in error &&
        error.name === "SequelizeForeignKeyConstraintError"
      ) {
        res.status(409).json({ error: "Product is referenced by other records" });
        return;
      }
      console.error("Unexpected error while deleting product permanently:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  deactivate: async (req: Request, res: Response): Promise<void> => {
    const rawId = req.params.id;
    const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      await product.update({ isActive: false });
      res.status(200).json({ message: "Product deactivated", product });
    } catch (error) {
      console.error("Unexpected error while deactivating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
