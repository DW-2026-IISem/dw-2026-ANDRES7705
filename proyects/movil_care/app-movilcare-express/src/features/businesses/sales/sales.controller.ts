import { Request, Response } from "express";
import { sequelize } from "../../../databases/db";
import { Customer } from "../customers/customers.model";
import { Product } from "../products/products.model";
import { SaleDetail } from "../sale-details/sale-details.model";
import { SerializedUnit } from "../serialized-units/serialized-units.model";
import { createCrudController } from "../shared/crud.controller";
import { Sale } from "./sales.model";

const parseInteger = (value: unknown): number | undefined => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
};

export const salesController = {
  ...createCrudController(Sale, {
    fields: [
      "number",
      "customerId",
      "sellerId",
      "soldAt",
      "subtotal",
      "taxes",
      "total",
      "discount",
      "state",
    ],
    requiredFields: ["number", "customerId", "soldAt", "subtotal", "taxes", "total"],
  }),
  confirm: async (req: Request, res: Response): Promise<void> => {
    const saleId = parseInteger(req.params.id);
    if (saleId === undefined || saleId < 1) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }

    const transaction = await sequelize.transaction();

    try {
      const sale = await Sale.findByPk(saleId, {
        transaction,
        include: [
          {
            model: SaleDetail,
            as: "saleDetails",
          },
        ],
      });

      if (!sale) {
        res.status(404).json({ error: "Sale not found" });
        return;
      }

      if (sale.state !== "DRAFT") {
        throw new Error("Only DRAFT sales can be confirmed");
      }

      const customer = await Customer.findByPk(sale.customerId, { transaction });
      if (!customer || !customer.isActive) {
        throw new Error("Customer is inactive or does not exist");
      }

      const details = sale.get("saleDetails") as SaleDetail[] | undefined;
      if (!details || details.length === 0) {
        throw new Error("A sale must contain at least one detail");
      }

      let subtotal = 0;
      let discount = 0;
      let taxes = 0;

      for (const detail of details) {
        const product = await Product.findByPk(detail.productId, { transaction });
        if (!product || !product.isActive) {
          throw new Error(`Product ${detail.productId} is inactive or missing`);
        }

        const lineSubtotal = Number(detail.quantity) * Number(detail.unitPrice);
        const lineDiscount = Number(detail.discount || 0);
        const taxPercentage = Number(detail.taxPercentage ?? product.taxPercentage ?? 0);
        const lineTaxes = ((lineSubtotal - lineDiscount) * taxPercentage) / 100;
        const lineTotal = lineSubtotal - lineDiscount + lineTaxes;

        await detail.update(
          {
            total: Number(lineTotal).toFixed(2),
            taxPercentage: Number(taxPercentage).toFixed(2),
          },
          { transaction }
        );

        if (product.requiresSerial) {
          if (detail.quantity !== 1) {
            throw new Error(`Product ${product.name} requires quantity 1 when serialized`);
          }
          if (detail.serializedUnitId === null || detail.serializedUnitId === undefined) {
            throw new Error(`Product ${product.name} requires a serialized unit`);
          }

          const serializedUnit = await SerializedUnit.findByPk(detail.serializedUnitId, {
            transaction,
          });

          if (!serializedUnit || !serializedUnit.isActive) {
            throw new Error(`Serialized unit ${detail.serializedUnitId} is missing or inactive`);
          }

          if (serializedUnit.productId !== product.id) {
            throw new Error(`Serialized unit ${detail.serializedUnitId} does not belong to product ${product.id}`);
          }

          if (serializedUnit.state !== "IN_STOCK") {
            throw new Error(`Serialized unit ${detail.serializedUnitId} is not available in stock`);
          }

          await serializedUnit.update({ state: "SOLD" }, { transaction });
        }

        subtotal += lineSubtotal;
        discount += lineDiscount;
        taxes += lineTaxes;
      }

      const total = subtotal - discount + taxes;

      await sale.update(
        {
          subtotal: Number(subtotal).toFixed(2),
          discount: Number(discount).toFixed(2),
          taxes: Number(taxes).toFixed(2),
          total: Number(total).toFixed(2),
          state: "CONFIRMED",
        },
        { transaction }
      );

      await transaction.commit();

      const refreshedSale = await Sale.findByPk(saleId, {
        include: [
          {
            model: SaleDetail,
            as: "saleDetails",
          },
        ],
      });

      res.status(200).json({ message: "Sale confirmed successfully", sale: refreshedSale });
    } catch (error) {
      await transaction.rollback();
      const message = error instanceof Error ? error.message : "Unable to confirm sale";
      res.status(400).json({ error: message });
    }
  },
};

export default salesController;
