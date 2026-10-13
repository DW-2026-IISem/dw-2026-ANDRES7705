
import { Request, Response } from "express";
import { createCrudController } from "../shared/crud.controller";
import { Payment } from "./payments.model";
import { Sale } from "../sales/sales.model";
import { ServiceOrder } from "../service-orders/service-orders.model";

const crud = createCrudController(Payment, {
  fields: [
    "referenceType",
    "referenceId",
    "method",
    "amount",
    "date",
    "status",
  ],
  requiredFields: [
    "referenceType",
    "referenceId",
    "method",
    "amount",
  ],
});

export const paymentsController = {
  ...crud,

  create: async (req: Request, res: Response): Promise<void> => {
    const body: unknown = req.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const data = body as Record<string, unknown>;
    const referenceType = data.referenceType;
    const referenceId = data.referenceId;

    if (
      !["SALE", "SERVICE_ORDER"].includes(
        String(referenceType)
      )
    ) {
      res.status(400).json({
        error: "referenceType must be SALE or SERVICE_ORDER",
      });
      return;
    }

    const id =
      typeof referenceId === "number"
        ? referenceId
        : typeof referenceId === "string" &&
            /^\d+$/.test(referenceId)
          ? Number(referenceId)
          : NaN;

    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({
        error: "referenceId must be a positive integer",
      });
      return;
    }

    try {
      const referencedRecord =
        referenceType === "SALE"
          ? await Sale.findByPk(id)
          : await ServiceOrder.findByPk(id);

      if (!referencedRecord) {
        res.status(400).json({
          error: "The referenced sale or service order does not exist",
        });
        return;
      }

      await crud.create(req, res);
    } catch (error) {
      console.error("Error validating payment reference:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  },
};
