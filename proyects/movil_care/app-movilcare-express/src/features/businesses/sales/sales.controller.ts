import { Request, Response } from "express";
import { Transaction } from "sequelize";
import { sequelize } from "../../../databases/db";
import { Customer } from "../customers/customers.model";
import { Employee } from "../employees/employees.model";
import { Product } from "../products/products.model";
import { SaleDetail } from "../sale-details/sale-details.model";
import { SerializedUnit } from "../serialized-units/serialized-units.model";
import { createCrudController } from "../shared/crud.controller";
import { Sale } from "./sales.model";

class SaleRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400
  ) {
    super(message);
  }
}

type SaleItemInput = {
  productId: number;
  quantity: number;
  serializedUnitId?: number | null;
  discount?: number;
  notes?: string | null;
};

type SaleCreateBody = {
  number?: string;
  customerId: number;
  sellerId?: number | null;
  soldAt?: string;
  items: SaleItemInput[];
};

const parseInteger = (value: unknown): number | undefined => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const money = (value: number): string => value.toFixed(2);

function makeSaleNumber(): string {
  return `S${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`.slice(0, 20);
}

async function assertActiveCustomer(customerId: number, transaction: Transaction): Promise<void> {
  const customer = await Customer.findByPk(customerId, { transaction });
  if (!customer) throw new SaleRequestError("Customer not found", 404);
  if (!customer.isActive) throw new SaleRequestError("Customer is inactive");
}

async function restoreSaleInventory(sale: Sale, transaction: Transaction): Promise<void> {
  if (sale.state !== "CONFIRMED") return;

  const details = await SaleDetail.findAll({
    where: { saleId: sale.id, isActive: true },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  for (const detail of details) {
    const product = await Product.findByPk(detail.productId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!product) {
      throw new SaleRequestError(`Product ${detail.productId} no longer exists`, 409);
    }

    if (product.requiresSerial) {
      if (!detail.serializedUnitId) {
        throw new SaleRequestError(`Sale detail ${detail.id} has no serialized unit`, 409);
      }
      const unit = await SerializedUnit.findByPk(detail.serializedUnitId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!unit || unit.state !== "SOLD") {
        throw new SaleRequestError(
          `Serialized unit ${detail.serializedUnitId} is no longer in SOLD state`,
          409
        );
      }
      await unit.update({ state: "IN_STOCK" }, { transaction });
    } else {
      await product.update(
        { stockQuantity: product.stockQuantity + detail.quantity },
        { transaction }
      );
    }
  }
}

const crud = createCrudController(Sale, {
  fields: ["customerId", "sellerId", "soldAt"],
  requiredFields: ["customerId", "soldAt"],
});

export const salesController = {
  ...crud,
  list: async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit === undefined ? 20 : parseInteger(req.query.limit);
    const offset = req.query.offset === undefined ? 0 : parseInteger(req.query.offset);
    if (
      limit === undefined ||
      limit < 1 ||
      limit > 100 ||
      offset === undefined ||
      offset < 0
    ) {
      res.status(400).json({ error: "limit must be 1-100 and offset must be a non-negative integer" });
      return;
    }

    try {
      const { rows, count } = await Sale.findAndCountAll({
        limit,
        offset,
        order: [["id", "DESC"]],
        include: [{ model: SaleDetail, as: "saleDetails", where: { isActive: true }, required: false }],
      });
      res.status(200).json({ items: rows, total: count, limit, offset });
    } catch (error) {
      console.error("Unexpected error while listing sales:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getById: async (req: Request, res: Response): Promise<void> => {
    const saleId = parseInteger(req.params.id);
    if (saleId === undefined || saleId < 1) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      const sale = await Sale.findByPk(saleId, {
        include: [{ model: SaleDetail, as: "saleDetails", where: { isActive: true }, required: false }],
      });
      if (!sale) {
        res.status(404).json({ error: "Sale not found" });
        return;
      }
      res.status(200).json(sale);
    } catch (error) {
      console.error("Unexpected error while getting a sale:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const body: unknown = req.body;
    if (!isRecord(body) || !Array.isArray(body.items) || body.items.length === 0) {
      res.status(400).json({ error: "customerId and at least one item are required" });
      return;
    }
    const allowedSaleFields = new Set(["number", "customerId", "sellerId", "soldAt", "items"]);
    if (Object.keys(body).some((key) => !allowedSaleFields.has(key))) {
      res.status(400).json({ error: "Request contains unsupported sale fields" });
      return;
    }
    if (
      body.number !== undefined &&
      (typeof body.number !== "string" || body.number.trim().length < 1 || body.number.trim().length > 20)
    ) {
      res.status(400).json({ error: "number must be a non-empty string of at most 20 characters" });
      return;
    }

    const customerId = body.customerId;
    const sellerId = body.sellerId;
    if (!Number.isSafeInteger(customerId) || Number(customerId) < 1) {
      res.status(400).json({ error: "customerId must be a positive integer" });
      return;
    }
    if (
      sellerId !== undefined &&
      sellerId !== null &&
      (!Number.isSafeInteger(sellerId) || Number(sellerId) < 1)
    ) {
      res.status(400).json({ error: "sellerId must be null or a positive integer" });
      return;
    }

    const items = body.items as unknown[];
    if (
      items.some(
        (item) =>
          !isRecord(item) ||
          Object.keys(item).some(
            (key) => !["productId", "quantity", "serializedUnitId", "discount", "notes"].includes(key)
          ) ||
          !Number.isSafeInteger(item.productId) ||
          Number(item.productId) < 1 ||
          !Number.isSafeInteger(item.quantity) ||
          Number(item.quantity) < 1 ||
          (item.serializedUnitId !== undefined &&
            item.serializedUnitId !== null &&
            (!Number.isSafeInteger(item.serializedUnitId) || Number(item.serializedUnitId) < 1)) ||
          (item.discount !== undefined &&
            (typeof item.discount !== "number" || !Number.isFinite(item.discount) || item.discount < 0)) ||
          (item.notes !== undefined &&
            item.notes !== null &&
            (typeof item.notes !== "string" || item.notes.length > 255))
      )
    ) {
      res.status(400).json({ error: "Each item must have valid productId, quantity, and optional fields" });
      return;
    }

    const transaction = await sequelize.transaction();
    try {
      await assertActiveCustomer(Number(customerId), transaction);

      if (sellerId !== undefined && sellerId !== null) {
        const seller = await Employee.findByPk(Number(sellerId), { transaction });
        if (!seller || !seller.isActive) {
          throw new SaleRequestError("Seller is inactive or does not exist", 400);
        }
      }

      const prepared: Array<{
        product: Product;
        item: SaleItemInput;
        unitPrice: number;
        taxPercentage: number;
        total: number;
      }> = [];
      let subtotal = 0;
      let discount = 0;
      let taxes = 0;
      const serialUnitsInSale = new Set<number>();
      const requestedQuantities = new Map<number, number>();

      for (const rawItem of items) {
        const item = rawItem as SaleItemInput;
        const product = await Product.findByPk(item.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!product || !product.isActive) {
          throw new SaleRequestError(`Product ${item.productId} is inactive or missing`, 404);
        }

        const unitPrice = Number(product.price);
        const lineDiscount = Number(item.discount ?? 0);
        const taxPercentage = Number(product.taxPercentage ?? 0);
        const lineSubtotal = item.quantity * unitPrice;
        const lineTaxes = ((lineSubtotal - lineDiscount) * taxPercentage) / 100;
        const lineTotal = lineSubtotal - lineDiscount + lineTaxes;
        if (lineDiscount > lineSubtotal) {
          throw new SaleRequestError(`Discount exceeds product ${product.id} line subtotal`);
        }

        if (product.requiresSerial) {
          if (item.quantity !== 1 || !item.serializedUnitId) {
            throw new SaleRequestError(
              `Product ${product.id} requires quantity 1 and a serializedUnitId`
            );
          }
          if (serialUnitsInSale.has(item.serializedUnitId)) {
            throw new SaleRequestError(`Serialized unit ${item.serializedUnitId} appears more than once`);
          }
          serialUnitsInSale.add(item.serializedUnitId);
          const unit = await SerializedUnit.findByPk(item.serializedUnitId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
          });
          if (
            !unit ||
            !unit.isActive ||
            unit.productId !== product.id ||
            unit.state !== "IN_STOCK"
          ) {
            throw new SaleRequestError(
              `Serialized unit ${item.serializedUnitId} is unavailable for product ${product.id}`
            );
          }
        } else {
          if (item.serializedUnitId != null) {
            throw new SaleRequestError(`Product ${product.id} does not use serialized units`);
          }
          const requestedQuantity = (requestedQuantities.get(product.id) ?? 0) + item.quantity;
          if (product.stockQuantity < requestedQuantity) {
            throw new SaleRequestError(
              `Insufficient stock for product ${product.id}: available ${product.stockQuantity}, requested ${requestedQuantity}`
            );
          }
          requestedQuantities.set(product.id, requestedQuantity);
        }

        subtotal += lineSubtotal;
        discount += lineDiscount;
        taxes += lineTaxes;
        prepared.push({ product, item, unitPrice, taxPercentage, total: lineTotal });
      }

      const soldAt = body.soldAt === undefined ? new Date() : new Date(String(body.soldAt));
      if (!Number.isFinite(soldAt.getTime())) {
        throw new SaleRequestError("soldAt must be a valid date");
      }

      const sale = await Sale.create(
        {
          number:
            typeof body.number === "string" && body.number.trim()
              ? body.number.trim()
              : makeSaleNumber(),
          customerId: Number(customerId),
          sellerId: sellerId == null ? null : Number(sellerId),
          soldAt,
          subtotal: money(subtotal),
          discount: money(discount),
          taxes: money(taxes),
          total: money(subtotal - discount + taxes),
          state: "DRAFT",
        },
        { transaction }
      );

      const details: SaleDetail[] = [];
      for (const line of prepared) {
        details.push(
          await SaleDetail.create(
            {
              saleId: sale.id,
              productId: line.product.id,
              serializedUnitId: line.item.serializedUnitId ?? null,
              quantity: line.item.quantity,
              unitPrice: money(line.unitPrice),
              discount: money(Number(line.item.discount ?? 0)),
              taxPercentage: money(line.taxPercentage),
              total: money(line.total),
              notes: line.item.notes ?? null,
              isActive: true,
            },
            { transaction }
          )
        );
      }

      await transaction.commit();
      res.status(201).json({ sale, saleDetails: details });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof SaleRequestError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error("Unexpected error while creating a sale:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  replace: async (req: Request, res: Response): Promise<void> => {
    await updateSale(req, res, true);
  },
  update: async (req: Request, res: Response): Promise<void> => {
    await updateSale(req, res, false);
  },
  confirm: async (req: Request, res: Response): Promise<void> => {
    const saleId = parseInteger(req.params.id);
    if (saleId === undefined || saleId < 1) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }

    try {
      const result = await sequelize.transaction(async (transaction) => {
        const sale = await Sale.findByPk(saleId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!sale) throw new SaleRequestError("Sale not found", 404);
        if (sale.state !== "DRAFT") throw new SaleRequestError("Only DRAFT sales can be confirmed");

        const customer = await Customer.findByPk(sale.customerId, { transaction });
        if (!customer || !customer.isActive) {
          throw new SaleRequestError("Customer is inactive or does not exist");
        }

        const details = await SaleDetail.findAll({
          where: { saleId, isActive: true },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (details.length === 0) throw new SaleRequestError("A sale must contain at least one detail");

        let subtotal = 0;
        let discount = 0;
        let taxes = 0;

        for (const detail of details) {
          const product = await Product.findByPk(detail.productId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
          });
          if (!product || !product.isActive) {
            throw new SaleRequestError(`Product ${detail.productId} is inactive or missing`);
          }

          const lineSubtotal = Number(detail.quantity) * Number(detail.unitPrice);
          const lineDiscount = Number(detail.discount || 0);
          const taxPercentage = Number(detail.taxPercentage ?? product.taxPercentage ?? 0);
          if (lineDiscount > lineSubtotal) {
            throw new SaleRequestError(`Discount exceeds product ${product.id} line subtotal`);
          }
          const lineTaxes = ((lineSubtotal - lineDiscount) * taxPercentage) / 100;
          const lineTotal = lineSubtotal - lineDiscount + lineTaxes;

          if (product.requiresSerial) {
            if (detail.quantity !== 1 || detail.serializedUnitId === null) {
              throw new SaleRequestError(`Product ${product.name} requires a serialized unit`);
            }
            const unit = await SerializedUnit.findByPk(detail.serializedUnitId, {
              transaction,
              lock: transaction.LOCK.UPDATE,
            });
            if (
              !unit ||
              !unit.isActive ||
              unit.productId !== product.id ||
              unit.state !== "IN_STOCK"
            ) {
              throw new SaleRequestError(
                `Serialized unit ${detail.serializedUnitId} is unavailable`
              );
            }
            await unit.update({ state: "SOLD" }, { transaction });
          } else {
            if (detail.serializedUnitId !== null) {
              throw new SaleRequestError(`Product ${product.id} does not use serialized units`);
            }
            if (product.stockQuantity < detail.quantity) {
              throw new SaleRequestError(
                `Insufficient stock for product ${product.id}: available ${product.stockQuantity}, requested ${detail.quantity}`
              );
            }
            await product.update(
              { stockQuantity: product.stockQuantity - detail.quantity },
              { transaction }
            );
          }

          await detail.update(
            {
              total: money(lineTotal),
              taxPercentage: money(taxPercentage),
            },
            { transaction }
          );
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
            state: "CONFIRMED",
          },
          { transaction }
        );
        return sale;
      });

      const refreshedSale = await Sale.findByPk(saleId, {
        include: [{ model: SaleDetail, as: "saleDetails", where: { isActive: true }, required: false }],
      });
      res.status(200).json({ message: "Sale confirmed successfully", sale: refreshedSale ?? result });
    } catch (error) {
      if (error instanceof SaleRequestError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error("Unexpected error while confirming a sale:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  cancel: async (req: Request, res: Response): Promise<void> => {
    const saleId = parseInteger(req.params.id);
    if (saleId === undefined || saleId < 1) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      await sequelize.transaction(async (transaction) => {
        const sale = await Sale.findByPk(saleId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!sale) throw new SaleRequestError("Sale not found", 404);
        if (sale.state !== "DRAFT" && sale.state !== "CONFIRMED") {
          throw new SaleRequestError("Only DRAFT or CONFIRMED sales can be cancelled");
        }
        await restoreSaleInventory(sale, transaction);
        await sale.update({ state: "CANCELLED" }, { transaction });
      });
      res.status(200).json({ message: "Sale cancelled successfully", id: saleId });
    } catch (error) {
      if (error instanceof SaleRequestError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error("Unexpected error while cancelling a sale:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    const saleId = parseInteger(req.params.id);
    if (saleId === undefined || saleId < 1) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    try {
      await sequelize.transaction(async (transaction) => {
        const sale = await Sale.findByPk(saleId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!sale) throw new SaleRequestError("Sale not found", 404);
        if (sale.state === "CONFIRMED" || sale.state === "PAID") {
          throw new SaleRequestError("Cancel the sale before permanently deleting it", 409);
        }
        await SaleDetail.destroy({ where: { saleId }, transaction });
        await sale.destroy({ transaction });
      });
      res.status(200).json({ message: "Sale permanently deleted", id: saleId });
    } catch (error) {
      if (error instanceof SaleRequestError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error("Unexpected error while deleting a sale:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

async function updateSale(req: Request, res: Response, replace: boolean): Promise<void> {
  const saleId = parseInteger(req.params.id);
  const body: unknown = req.body;
  if (saleId === undefined || saleId < 1 || !isRecord(body)) {
    res.status(400).json({ error: "A valid id and request body are required" });
    return;
  }
  const allowed = new Set(["customerId", "sellerId", "soldAt"]);
  const keys = Object.keys(body);
  if (
    keys.length === 0 ||
    keys.some((key) => !allowed.has(key)) ||
    (replace && (!("customerId" in body) || !("soldAt" in body)))
  ) {
    res.status(400).json({ error: "Only customerId, sellerId, and soldAt can be updated" });
    return;
  }

  try {
    const updated = await sequelize.transaction(async (transaction) => {
      const sale = await Sale.findByPk(saleId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!sale) throw new SaleRequestError("Sale not found", 404);
      if (sale.state !== "DRAFT") throw new SaleRequestError("Only DRAFT sales can be edited");

      const changes: { customerId?: number; sellerId?: number | null; soldAt?: Date } = {};
      if (body.customerId !== undefined) {
        if (!Number.isSafeInteger(body.customerId) || Number(body.customerId) < 1) {
          throw new SaleRequestError("customerId must be a positive integer");
        }
        await assertActiveCustomer(Number(body.customerId), transaction);
        changes.customerId = Number(body.customerId);
      }
      if (body.sellerId !== undefined) {
        if (
          body.sellerId !== null &&
          (!Number.isSafeInteger(body.sellerId) || Number(body.sellerId) < 1)
        ) {
          throw new SaleRequestError("sellerId must be null or a positive integer");
        }
        if (body.sellerId !== null) {
          const seller = await Employee.findByPk(Number(body.sellerId), { transaction });
          if (!seller || !seller.isActive) {
            throw new SaleRequestError("Seller is inactive or does not exist");
          }
        }
        changes.sellerId = body.sellerId === null ? null : Number(body.sellerId);
      }
      if (body.soldAt !== undefined) {
        const soldAt = new Date(String(body.soldAt));
        if (!Number.isFinite(soldAt.getTime())) throw new SaleRequestError("soldAt must be a valid date");
        changes.soldAt = soldAt;
      }
      await sale.update(changes, { transaction });
      return sale;
    });
    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof SaleRequestError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    console.error("Unexpected error while updating a sale:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default salesController;
