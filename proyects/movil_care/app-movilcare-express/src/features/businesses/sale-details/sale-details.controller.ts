import { Request, Response } from "express";
import { Transaction } from "sequelize";
import { sequelize } from "../../../databases/db";
import { Product } from "../products/products.model";
import { Sale } from "../sales/sales.model";
import { SerializedUnit } from "../serialized-units/serialized-units.model";
import { SaleDetail } from "./sale-details.model";

class DetailRequestError extends Error {
  constructor(
    message: string,
    public readonly status = 400
  ) {
    super(message);
  }
}

type DetailInput = {
  saleId?: number;
  productId?: number;
  serializedUnitId?: number | null;
  quantity?: number;
  discount?: number;
  notes?: string | null;
};

const parseId = (value: unknown): number | undefined => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const money = (value: number): string => value.toFixed(2);

function validateInput(body: unknown, requireBase: boolean): DetailInput {
  if (!isRecord(body)) throw new DetailRequestError("Request body must be an object");
  const allowed = new Set([
    "saleId",
    "productId",
    "serializedUnitId",
    "quantity",
    "discount",
    "notes",
  ]);
  if (Object.keys(body).length === 0 || Object.keys(body).some((key) => !allowed.has(key))) {
    throw new DetailRequestError("Request contains no editable fields or unknown fields");
  }
  if (
    requireBase &&
    (!Number.isSafeInteger(body.saleId) ||
      Number(body.saleId) < 1 ||
      !Number.isSafeInteger(body.productId) ||
      Number(body.productId) < 1 ||
      !Number.isSafeInteger(body.quantity) ||
      Number(body.quantity) < 1)
  ) {
    throw new DetailRequestError("saleId, productId, and positive integer quantity are required");
  }
  if (
    body.saleId !== undefined &&
    (!Number.isSafeInteger(body.saleId) || Number(body.saleId) < 1)
  ) {
    throw new DetailRequestError("saleId must be a positive integer");
  }
  if (
    body.productId !== undefined &&
    (!Number.isSafeInteger(body.productId) || Number(body.productId) < 1)
  ) {
    throw new DetailRequestError("productId must be a positive integer");
  }
  if (
    body.quantity !== undefined &&
    (!Number.isSafeInteger(body.quantity) || Number(body.quantity) < 1)
  ) {
    throw new DetailRequestError("quantity must be a positive integer");
  }
  if (
    body.serializedUnitId !== undefined &&
    body.serializedUnitId !== null &&
    (!Number.isSafeInteger(body.serializedUnitId) || Number(body.serializedUnitId) < 1)
  ) {
    throw new DetailRequestError("serializedUnitId must be null or a positive integer");
  }
  if (
    body.discount !== undefined &&
    (typeof body.discount !== "number" || !Number.isFinite(body.discount) || body.discount < 0)
  ) {
    throw new DetailRequestError("discount must be a non-negative number");
  }
  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
    throw new DetailRequestError("notes must be a string or null");
  }
  return body as DetailInput;
}

async function recalculateSale(saleId: number, transaction: Transaction): Promise<void> {
  const sale = await Sale.findByPk(saleId, { transaction, lock: transaction.LOCK.UPDATE });
  if (!sale) throw new DetailRequestError("Sale not found", 404);

  const details = await SaleDetail.findAll({
    where: { saleId, isActive: true },
    transaction,
  });
  let subtotal = 0;
  let discount = 0;
  let taxes = 0;
  for (const detail of details) {
    const lineSubtotal = Number(detail.quantity) * Number(detail.unitPrice);
    const lineDiscount = Number(detail.discount);
    const taxPercentage = Number(detail.taxPercentage ?? 0);
    const lineTaxes = ((lineSubtotal - lineDiscount) * taxPercentage) / 100;
    const lineTotal = lineSubtotal - lineDiscount + lineTaxes;
    await detail.update({ total: money(lineTotal) }, { transaction });
    subtotal += lineSubtotal;
    discount += lineDiscount;
    taxes += lineTaxes;
  }
  await sale.update(
    {
      subtotal: money(subtotal),
      discount: money(discount),
      taxes: money(taxes),
      total: money(subtotal - discount + taxes),
    },
    { transaction }
  );
}

async function assertDraftSale(saleId: number, transaction: Transaction): Promise<Sale> {
  const sale = await Sale.findByPk(saleId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!sale) throw new DetailRequestError("Sale not found", 404);
  if (sale.state !== "DRAFT") {
    throw new DetailRequestError("Sale details can only be modified while the sale is DRAFT", 409);
  }
  return sale;
}

async function prepareDetail(
  productId: number,
  quantity: number,
  serializedUnitId: number | null | undefined,
  discount: number,
  transaction: Transaction
): Promise<{
  product: Product;
  serializedUnitId: number | null;
  unitPrice: number;
  taxPercentage: number;
  total: number;
}> {
  const product = await Product.findByPk(productId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!product || !product.isActive) {
    throw new DetailRequestError(`Product ${productId} is inactive or missing`, 404);
  }

  let unitId: number | null = serializedUnitId ?? null;
  if (product.requiresSerial) {
    if (quantity !== 1 || unitId === null) {
      throw new DetailRequestError(`Product ${product.id} requires quantity 1 and a serialized unit`);
    }
    const unit = await SerializedUnit.findByPk(unitId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!unit || !unit.isActive || unit.productId !== product.id || unit.state !== "IN_STOCK") {
      throw new DetailRequestError(`Serialized unit ${unitId} is unavailable`);
    }
  } else {
    if (unitId !== null) {
      throw new DetailRequestError(`Product ${product.id} does not use serialized units`);
    }
    if (product.stockQuantity < quantity) {
      throw new DetailRequestError(
        `Insufficient stock for product ${product.id}: available ${product.stockQuantity}, requested ${quantity}`
      );
    }
  }

  const unitPrice = Number(product.price);
  const taxPercentage = Number(product.taxPercentage ?? 0);
  const lineSubtotal = unitPrice * quantity;
  if (discount > lineSubtotal) {
    throw new DetailRequestError("discount cannot exceed the line subtotal");
  }
  return {
    product,
    serializedUnitId: unitId,
    unitPrice,
    taxPercentage,
    total: lineSubtotal - discount + ((lineSubtotal - discount) * taxPercentage) / 100,
  };
}

async function assertDraftStockAvailable(
  saleId: number,
  product: Product,
  quantity: number,
  transaction: Transaction,
  excludedDetailId?: number
): Promise<void> {
  if (product.requiresSerial) return;

  const existingDetails = await SaleDetail.findAll({
    attributes: ["id", "quantity"],
    where: { saleId, productId: product.id, isActive: true },
    transaction,
  });
  const quantityAlreadyInSale = existingDetails.reduce(
    (sum, detail) => sum + (detail.id === excludedDetailId ? 0 : detail.quantity),
    0
  );
  const requestedQuantity = quantityAlreadyInSale + quantity;

  if (requestedQuantity > product.stockQuantity) {
    throw new DetailRequestError(
      `Insufficient stock for product ${product.id}: available ${product.stockQuantity}, requested ${requestedQuantity}`
    );
  }
}

export const saleDetailsController = {
  list: async (_req: Request, res: Response): Promise<void> => {
    try {
      const saleDetails = await SaleDetail.findAll({
        where: { isActive: true },
        order: [["id", "DESC"]],
      });
      res.status(200).json({ saleDetails });
    } catch (error) {
      console.error("Unexpected error while listing sale details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getById: async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      const saleDetail = await SaleDetail.findOne({ where: { id, isActive: true } });
      if (!saleDetail) {
        res.status(404).json({ error: "Sale detail not found" });
        return;
      }
      res.status(200).json({ saleDetail });
    } catch (error) {
      console.error("Unexpected error while getting a sale detail:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  create: async (req: Request, res: Response): Promise<void> => {
    let input: DetailInput;
    try {
      input = validateInput(req.body, true);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
      return;
    }
    try {
      const saleDetail = await sequelize.transaction(async (transaction) => {
        await assertDraftSale(Number(input.saleId), transaction);
        const discount = Number(input.discount ?? 0);
        const prepared = await prepareDetail(
          Number(input.productId),
          Number(input.quantity),
          input.serializedUnitId,
          discount,
          transaction
        );
        await assertDraftStockAvailable(
          Number(input.saleId),
          prepared.product,
          Number(input.quantity),
          transaction
        );
        if (prepared.serializedUnitId !== null) {
          const duplicate = await SaleDetail.findOne({
            where: {
              saleId: Number(input.saleId),
              serializedUnitId: prepared.serializedUnitId,
              isActive: true,
            },
            transaction,
          });
          if (duplicate) throw new DetailRequestError("Serialized unit already appears in this sale");
        }
        const detail = await SaleDetail.create(
          {
            saleId: Number(input.saleId),
            productId: prepared.product.id,
            serializedUnitId: prepared.serializedUnitId,
            quantity: Number(input.quantity),
            unitPrice: money(prepared.unitPrice),
            discount: money(discount),
            taxPercentage: money(prepared.taxPercentage),
            total: money(prepared.total),
            notes: input.notes ?? null,
            isActive: true,
          },
          { transaction }
        );
        await recalculateSale(Number(input.saleId), transaction);
        return detail;
      });
      res.status(201).json({ saleDetail });
    } catch (error) {
      if (error instanceof DetailRequestError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error("Unexpected error while creating a sale detail:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  replace: async (req: Request, res: Response): Promise<void> => {
    await updateDetail(req, res, true);
  },
  update: async (req: Request, res: Response): Promise<void> => {
    await updateDetail(req, res, false);
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      await sequelize.transaction(async (transaction) => {
        const detail = await SaleDetail.findByPk(id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!detail) throw new DetailRequestError("Sale detail not found", 404);
        await assertDraftSale(detail.saleId, transaction);
        await detail.destroy({ transaction });
        await recalculateSale(detail.saleId, transaction);
      });
      res.status(200).json({ message: "Sale detail permanently deleted", id });
    } catch (error) {
      if (error instanceof DetailRequestError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error("Unexpected error while deleting a sale detail:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  deactivate: async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      const saleDetail = await sequelize.transaction(async (transaction) => {
        const detail = await SaleDetail.findByPk(id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!detail) throw new DetailRequestError("Sale detail not found", 404);
        await assertDraftSale(detail.saleId, transaction);
        await detail.update({ isActive: false }, { transaction });
        await recalculateSale(detail.saleId, transaction);
        return detail;
      });
      res.status(200).json({ message: "Sale detail deactivated", saleDetail });
    } catch (error) {
      if (error instanceof DetailRequestError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error("Unexpected error while deactivating a sale detail:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

async function updateDetail(req: Request, res: Response, replace: boolean): Promise<void> {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "id must be a positive integer" });
    return;
  }
  let input: DetailInput;
  try {
    input = validateInput(req.body, false);
    if (replace && (input.productId === undefined || input.quantity === undefined)) {
      throw new DetailRequestError("PUT requires productId and quantity");
    }
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
    return;
  }

  try {
    const saleDetail = await sequelize.transaction(async (transaction) => {
      const detail = await SaleDetail.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!detail || !detail.isActive) throw new DetailRequestError("Sale detail not found", 404);
      await assertDraftSale(detail.saleId, transaction);
      if (input.saleId !== undefined && input.saleId !== detail.saleId) {
        throw new DetailRequestError("A sale detail cannot be moved to another sale");
      }

      const productId = Number(input.productId ?? detail.productId);
      const quantity = Number(input.quantity ?? detail.quantity);
      const serializedUnitId =
        input.serializedUnitId === undefined ? detail.serializedUnitId : input.serializedUnitId;
      const discount = Number(input.discount ?? detail.discount);
      const prepared = await prepareDetail(
        productId,
        quantity,
        serializedUnitId,
        discount,
        transaction
      );
      await assertDraftStockAvailable(
        detail.saleId,
        prepared.product,
        quantity,
        transaction,
        detail.id
      );
      if (prepared.serializedUnitId !== null) {
        const duplicate = await SaleDetail.findOne({
          where: {
            saleId: detail.saleId,
            serializedUnitId: prepared.serializedUnitId,
            isActive: true,
          },
          transaction,
        });
        if (duplicate && duplicate.id !== detail.id) {
          throw new DetailRequestError("Serialized unit already appears in this sale");
        }
      }

      await detail.update(
        {
          productId,
          serializedUnitId: prepared.serializedUnitId,
          quantity,
          unitPrice: money(prepared.unitPrice),
          discount: money(discount),
          taxPercentage: money(prepared.taxPercentage),
          total: money(prepared.total),
          notes: input.notes === undefined ? detail.notes : input.notes,
        },
        { transaction }
      );
      await recalculateSale(detail.saleId, transaction);
      return detail;
    });
    res.status(200).json({ saleDetail });
  } catch (error) {
    if (error instanceof DetailRequestError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    console.error("Unexpected error while updating a sale detail:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default saleDetailsController;
