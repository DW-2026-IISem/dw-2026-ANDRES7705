import { Request, Response } from "express";
import {
  CreationAttributes,
  ForeignKeyConstraintError,
  Op,
  UniqueConstraintError,
  ValidationError,
} from "sequelize";
import { sequelize } from "../../../databases/db";
import { Customer } from "../customers/customers.model";
import { SerializedUnit } from "../serialized-units/serialized-units.model";
import { Warranty } from "../warranties/warranties.model";
import { createCrudController } from "../shared/crud.controller";
import { Diagnostic } from "./diagnostics.model";
import {
  SERVICE_ORDER_STATES,
  SERVICE_TYPES,
  ServiceOrder,
} from "./service-orders.model";
import { ServiceAuthorization } from "./service-authorizations.model";

const CREATE_FIELDS = [
  "number",
  "customerId",
  "serializedUnitId",
  "technicianId",
  "serviceType",
  "warrantyId",
  "originOrderId",
  "reportedIssue",
  "intakeCondition",
  "receivedAccessories",
  "openedAt",
  "estimatedDeliveryDate",
  "total",
] as const;

const crudController = createCrudController(ServiceOrder, {
  fields: ["technicianId", "reportedIssue", "intakeCondition", "receivedAccessories", "estimatedDeliveryDate"],
  requiredFields: [],
});

function parsePositiveInteger(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  if (typeof value === "string" && !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : undefined;
}

function isValidAmount(value: unknown): boolean {
  if (typeof value === "number") {
    return (
      Number.isFinite(value) &&
      value >= 0 &&
      value <= 9999999999.99 &&
      Math.abs(value * 100 - Math.round(value * 100)) < 1e-7
    );
  }
  if (typeof value !== "string" || !/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value)) {
    return false;
  }
  return Number.isFinite(Number(value));
}

function sendError(res: Response, error: unknown, operation: string): void {
  if (error instanceof UniqueConstraintError) {
    res.status(409).json({ error: "A record with these unique values already exists" });
    return;
  }
  if (error instanceof ForeignKeyConstraintError) {
    res.status(400).json({ error: "One or more referenced records do not exist" });
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

function isApplicableWarranty(warranty: Warranty, serializedUnitId: number, openedAt: Date): boolean {
  const startDate = warranty.startDate.getTime();
  const endDate = warranty.endDate.getTime();
  const receivedTime = openedAt.getTime();
  return (
    warranty.isActive &&
    warranty.state === "VALID" &&
    (warranty.serializedUnitId === null || warranty.serializedUnitId === serializedUnitId) &&
    startDate <= receivedTime &&
    endDate >= receivedTime
  );
}

export const serviceOrdersController = {
  ...crudController,

  create: async (req: Request, res: Response): Promise<void> => {
    const body: unknown = req.body;
    if (
      !isRecord(body) ||
      Object.keys(body).length === 0 ||
      Object.keys(body).some((field) => !CREATE_FIELDS.includes(field as (typeof CREATE_FIELDS)[number]))
    ) {
      res.status(400).json({ error: "Invalid service order body or unsupported fields" });
      return;
    }

    const requiredFields = [
      "number",
      "customerId",
      "serializedUnitId",
      "serviceType",
      "reportedIssue",
      "openedAt",
    ];
    if (requiredFields.some((field) => !Object.prototype.hasOwnProperty.call(body, field))) {
      res.status(400).json({ error: "Missing required service order fields" });
      return;
    }

    const customerId = parsePositiveInteger(body.customerId);
    const serializedUnitId = parsePositiveInteger(body.serializedUnitId);
    const technicianId = body.technicianId == null ? null : parsePositiveInteger(body.technicianId);
    const warrantyId = body.warrantyId == null ? null : parsePositiveInteger(body.warrantyId);
    const originOrderId = body.originOrderId == null ? null : parsePositiveInteger(body.originOrderId);
    const openedAt = parseDate(body.openedAt);

    if (
      typeof body.number !== "string" ||
      !body.number.trim() ||
      body.number.trim().length > 20 ||
      customerId === undefined ||
      serializedUnitId === undefined ||
      (body.technicianId != null && technicianId === undefined) ||
      (body.warrantyId != null && warrantyId === undefined) ||
      (body.originOrderId != null && originOrderId === undefined) ||
      typeof body.serviceType !== "string" ||
      !SERVICE_TYPES.includes(body.serviceType as (typeof SERVICE_TYPES)[number]) ||
      typeof body.reportedIssue !== "string" ||
      !body.reportedIssue.trim() ||
      openedAt === undefined ||
      (body.intakeCondition != null && typeof body.intakeCondition !== "string") ||
      (body.receivedAccessories != null &&
        (typeof body.receivedAccessories !== "string" || body.receivedAccessories.length > 255)) ||
      (body.estimatedDeliveryDate != null && parseDate(body.estimatedDeliveryDate) === undefined) ||
      (body.total !== undefined && !isValidAmount(body.total))
    ) {
      res.status(400).json({ error: "Invalid service order field values" });
      return;
    }

    if (body.serviceType === "RECURRENCE" && originOrderId === null) {
      res.status(400).json({ error: "originOrderId is required for a recurrence" });
      return;
    }
    if (body.serviceType === "COMMERCIAL_WARRANTY" && warrantyId === null) {
      res.status(400).json({ error: "warrantyId is required for a commercial warranty order" });
      return;
    }

    const transaction = await sequelize.transaction();
    let committed = false;
    try {
      const customer = await Customer.findByPk(customerId, { transaction });
      if (!customer || !customer.isActive) {
        await transaction.rollback();
        res.status(409).json({ error: "Customer is inactive or does not exist" });
        return;
      }

      const unit = await SerializedUnit.findByPk(serializedUnitId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!unit || !unit.isActive || unit.state !== "SOLD") {
        await transaction.rollback();
        res.status(409).json({ error: "The serialized unit must be active and SOLD to open a service order" });
        return;
      }

      if (body.serviceType === "COMMERCIAL_WARRANTY" && warrantyId !== null) {
        const warranty = await Warranty.findByPk(warrantyId, { transaction });
        if (!warranty || !isApplicableWarranty(warranty, serializedUnitId, openedAt)) {
          await transaction.rollback();
          res.status(409).json({ error: "warrantyId is not applicable to this serialized unit and date" });
          return;
        }
      }

      if (originOrderId !== null) {
        const originOrder = await ServiceOrder.findByPk(originOrderId, { transaction });
        if (!originOrder || originOrder.serializedUnitId !== serializedUnitId) {
          await transaction.rollback();
          res.status(409).json({ error: "originOrderId must reference an order for the same serialized unit" });
          return;
        }
      }

      const serviceOrder = await ServiceOrder.create(
        {
          ...body,
          customerId,
          serializedUnitId,
          technicianId,
          warrantyId,
          originOrderId,
          number: body.number.trim(),
          openedAt,
          state: "RECEIVED",
          total: body.total ?? 0,
        } as CreationAttributes<ServiceOrder>,
        { transaction }
      );
      await unit.update({ state: "IN_SERVICE" }, { transaction });
      await transaction.commit();
      committed = true;

      res.status(201).json(serviceOrder);
    } catch (error) {
      if (!committed) await transaction.rollback();
      sendError(res, error, "creating a service order");
    }
  },

  changeState: async (req: Request, res: Response): Promise<void> => {
    const id = parsePositiveInteger(req.params.id);
    const nextState = isRecord(req.body) ? req.body.state : undefined;
    if (
      id === undefined ||
      typeof nextState !== "string" ||
      !SERVICE_ORDER_STATES.includes(nextState as (typeof SERVICE_ORDER_STATES)[number])
    ) {
      res.status(400).json({ error: "Provide a valid service order id and state" });
      return;
    }

    const allowedTransitions: Record<string, readonly string[]> = {
      RECEIVED: ["DIAGNOSING", "REJECTED", "CANCELLED"],
      DIAGNOSING: ["AWAITING_AUTHORIZATION", "IN_REPAIR", "REJECTED", "CANCELLED"],
      AWAITING_AUTHORIZATION: ["IN_REPAIR", "REJECTED", "CANCELLED"],
      IN_REPAIR: ["READY"],
      READY: ["DELIVERED"],
    };

    const transaction = await sequelize.transaction();
    let committed = false;
    try {
      const serviceOrder = await ServiceOrder.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!serviceOrder) {
        await transaction.rollback();
        res.status(404).json({ error: "Service order not found" });
        return;
      }

      if (!(allowedTransitions[serviceOrder.state] ?? []).includes(nextState)) {
        await transaction.rollback();
        res.status(409).json({
          error: "State transition is not allowed",
          currentState: serviceOrder.state,
        });
        return;
      }

      if (nextState === "IN_REPAIR") {
        const diagnostics = await Diagnostic.findAll({
          attributes: ["id"],
          where: { serviceOrderId: serviceOrder.id },
          transaction,
        });
        const diagnosticIds = diagnostics.map((diagnostic) => diagnostic.id);
        if (diagnosticIds.length === 0) {
          await transaction.rollback();
          res.status(409).json({ error: "A service order requires a diagnostic before entering repair" });
          return;
        }

        if (serviceOrder.serviceType === "PAID_REPAIR") {
          const approvedAuthorizationCount =
            await ServiceAuthorization.count({
              where: { diagnosticId: { [Op.in]: diagnosticIds }, state: "APPROVED" },
              transaction,
            });
          if (approvedAuthorizationCount === 0) {
            await transaction.rollback();
            res.status(409).json({
              error: "A paid repair requires an approved authorization before entering repair",
            });
            return;
          }
        }
      }

      if (["DELIVERED", "REJECTED", "CANCELLED"].includes(nextState)) {
        const unit = await SerializedUnit.findByPk(serviceOrder.serializedUnitId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!unit || unit.state !== "IN_SERVICE") {
          await transaction.rollback();
          res.status(409).json({ error: "The serialized unit is not currently in service" });
          return;
        }
        await unit.update({ state: "SOLD" }, { transaction });
        await serviceOrder.update({ state: nextState, closedAt: new Date() }, { transaction });
      } else {
        await serviceOrder.update({ state: nextState }, { transaction });
      }

      await transaction.commit();
      committed = true;
      res.status(200).json(serviceOrder);
    } catch (error) {
      if (!committed) await transaction.rollback();
      sendError(res, error, "changing service order state");
    }
  },
};

export default serviceOrdersController;
