"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warrantiesController = void 0;
const sequelize_1 = require("sequelize");
const customers_model_1 = require("../customers/customers.model");
const sales_model_1 = require("../sales/sales.model");
const sale_details_model_1 = require("../sale-details/sale-details.model");
const serialized_units_model_1 = require("../serialized-units/serialized-units.model");
const crud_controller_1 = require("../shared/crud.controller");
const warranties_model_1 = require("./warranties.model");
const WARRANTY_TYPES = ["COMMERCIAL", "EXTENDED", "SUPPLIER"];
const WARRANTY_STATES = ["VALID", "EXPIRED", "CANCELLED", "CONSUMED"];
const EDITABLE_FIELDS = [
    "saleDetailId",
    "serializedUnitId",
    "type",
    "coverageDescription",
    "startDate",
    "endDate",
    "state",
    "isActive",
];
function parsePositiveInteger(value) {
    if (typeof value !== "string" || !/^\d+$/.test(value))
        return undefined;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}
function isValidDate(value) {
    return ((value instanceof Date && Number.isFinite(value.getTime())) ||
        (typeof value === "string" &&
            value.trim().length > 0 &&
            Number.isFinite(Date.parse(value))));
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function sendError(res, error, operation) {
    if (error instanceof sequelize_1.UniqueConstraintError) {
        res.status(409).json({ error: "A record with these unique values already exists" });
        return;
    }
    if (error instanceof sequelize_1.ValidationError) {
        res.status(400).json({
            error: "Validation failed",
            details: error.errors.map(({ path, message }) => ({ field: path, message })),
        });
        return;
    }
    if (error instanceof sequelize_1.ForeignKeyConstraintError) {
        res.status(400).json({ error: "saleDetailId or serializedUnitId does not exist" });
        return;
    }
    console.error(`Unexpected error while ${operation}:`, error);
    res.status(500).json({ error: "Internal server error" });
}
const crudController = (0, crud_controller_1.createCrudController)(warranties_model_1.Warranty, {
    fields: EDITABLE_FIELDS,
    requiredFields: ["saleDetailId", "type", "startDate", "endDate"],
    softDeleteField: "isActive",
});
exports.warrantiesController = {
    ...crudController,
    list: async (req, res) => {
        const limit = req.query.limit === undefined ? 20 : parsePositiveInteger(req.query.limit);
        const offset = req.query.offset === undefined
            ? 0
            : parsePositiveInteger(req.query.offset) ?? (req.query.offset === "0" ? 0 : undefined);
        const customerId = req.query.customerId === undefined
            ? undefined
            : parsePositiveInteger(req.query.customerId);
        const serial = typeof req.query.serial === "string" ? req.query.serial.trim() : undefined;
        const state = typeof req.query.state === "string" ? req.query.state : undefined;
        if (limit === undefined ||
            limit > 100 ||
            offset === undefined ||
            (req.query.customerId !== undefined && customerId === undefined) ||
            (req.query.serial !== undefined && (!serial || serial.length > 80)) ||
            (state !== undefined && !WARRANTY_STATES.includes(state))) {
            res.status(400).json({
                error: "Invalid query. Use limit 1-100, non-negative offset, positive customerId, serial up to 80 characters, and a valid state.",
            });
            return;
        }
        try {
            const result = await warranties_model_1.Warranty.findAndCountAll({
                where: state ? { state } : undefined,
                include: [
                    {
                        model: sale_details_model_1.SaleDetail,
                        as: "saleDetail",
                        required: customerId !== undefined,
                        include: [
                            {
                                model: sales_model_1.Sale,
                                as: "sale",
                                required: customerId !== undefined,
                                where: customerId === undefined ? undefined : { customerId },
                                include: [
                                    {
                                        model: customers_model_1.Customer,
                                        as: "customer",
                                        required: customerId !== undefined,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: serialized_units_model_1.SerializedUnit,
                        as: "serializedUnit",
                        required: serial !== undefined,
                        where: serial === undefined
                            ? undefined
                            : {
                                [sequelize_1.Op.or]: [{ serial }, { secondarySerial: serial }],
                            },
                    },
                ],
                limit,
                offset,
                order: [["id", "DESC"]],
                distinct: true,
            });
            res.status(200).json({
                items: result.rows,
                total: result.count,
                limit,
                offset,
            });
        }
        catch (error) {
            sendError(res, error, "listing warranties");
        }
    },
    create: async (req, res) => {
        if (!isRecord(req.body)) {
            res.status(400).json({ error: "Invalid warranty body" });
            return;
        }
        const body = req.body;
        if (Object.keys(body).length === 0 ||
            Object.keys(body).some((key) => !EDITABLE_FIELDS.includes(key)) ||
            !Object.prototype.hasOwnProperty.call(body, "saleDetailId") ||
            !Object.prototype.hasOwnProperty.call(body, "type") ||
            !Object.prototype.hasOwnProperty.call(body, "startDate") ||
            !Object.prototype.hasOwnProperty.call(body, "endDate")) {
            res.status(400).json({ error: "Missing required fields or unsupported fields" });
            return;
        }
        const saleDetailId = typeof body.saleDetailId === "number" && Number.isSafeInteger(body.saleDetailId)
            ? body.saleDetailId
            : parsePositiveInteger(body.saleDetailId);
        if (saleDetailId === undefined ||
            saleDetailId < 1 ||
            typeof body.type !== "string" ||
            !WARRANTY_TYPES.includes(body.type) ||
            !isValidDate(body.startDate) ||
            !isValidDate(body.endDate) ||
            (body.state !== undefined &&
                (typeof body.state !== "string" ||
                    !WARRANTY_STATES.includes(body.state))) ||
            (body.coverageDescription !== undefined &&
                body.coverageDescription !== null &&
                typeof body.coverageDescription !== "string") ||
            (body.isActive !== undefined && typeof body.isActive !== "boolean")) {
            res.status(400).json({ error: "Invalid saleDetailId, type, date, state, coverageDescription, or isActive" });
            return;
        }
        const requestedSerializedUnitId = body.serializedUnitId === undefined || body.serializedUnitId === null
            ? undefined
            : typeof body.serializedUnitId === "number" &&
                Number.isSafeInteger(body.serializedUnitId) &&
                body.serializedUnitId > 0
                ? body.serializedUnitId
                : parsePositiveInteger(body.serializedUnitId);
        if (body.serializedUnitId != null && requestedSerializedUnitId === undefined) {
            res.status(400).json({ error: "serializedUnitId must be a positive integer or null" });
            return;
        }
        try {
            const saleDetail = await sale_details_model_1.SaleDetail.findByPk(saleDetailId);
            if (!saleDetail) {
                res.status(404).json({ error: "Sale detail not found" });
                return;
            }
            const sale = await sales_model_1.Sale.findByPk(saleDetail.saleId);
            if (!sale || !["CONFIRMED", "PAID"].includes(sale.state)) {
                res.status(409).json({ error: "A warranty can only be created for a confirmed or paid sale" });
                return;
            }
            const serializedUnitId = saleDetail.serializedUnitId;
            if (requestedSerializedUnitId !== undefined &&
                String(requestedSerializedUnitId) !== String(serializedUnitId)) {
                res.status(400).json({
                    error: "serializedUnitId must match the unit linked to the sale detail",
                });
                return;
            }
            const warranty = await warranties_model_1.Warranty.create({
                ...body,
                saleDetailId,
                serializedUnitId,
                state: body.state ?? "VALID",
                isActive: body.isActive ?? true,
            });
            res.status(201).json(warranty);
        }
        catch (error) {
            sendError(res, error, "creating a warranty");
        }
    },
};
exports.default = exports.warrantiesController;
//# sourceMappingURL=warranties.controller.js.map