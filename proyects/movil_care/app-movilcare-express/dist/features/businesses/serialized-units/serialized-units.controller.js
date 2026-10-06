"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializedUnitsController = void 0;
const sequelize_1 = require("sequelize");
const serialized_units_model_1 = require("./serialized-units.model");
const VALID_STATES = ["IN_STOCK", "SOLD", "IN_SERVICE", "RETIRED"];
const STATE_FIELD = "state";
const ALLOWED_FIELD_SET = new Set([
    "productId",
    "serial",
    "secondarySerial",
    "state",
    "receivedAt",
    "isActive",
]);
function parsePositiveInteger(value) {
    if (typeof value !== "string" || !/^\d+$/.test(value))
        return undefined;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}
function parseNonNegativeInteger(value) {
    if (typeof value !== "string" || !/^\d+$/.test(value))
        return undefined;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function validateBodyShape(body, required) {
    if (!isRecord(body))
        return undefined;
    const keys = Object.keys(body);
    if (keys.length === 0 || keys.some((key) => !ALLOWED_FIELD_SET.has(key))) {
        return undefined;
    }
    if (required.some((field) => !Object.prototype.hasOwnProperty.call(body, field))) {
        return undefined;
    }
    return body;
}
function hasValidValues(body) {
    return Object.entries(body).every(([field, value]) => {
        switch (field) {
            case "productId":
                return typeof value === "number" && Number.isInteger(value) && value > 0;
            case "serial":
            case "secondarySerial":
                return typeof value === "string" && value.trim().length > 0;
            case "state":
                return typeof value === "string" && VALID_STATES.includes(value);
            case "receivedAt":
                return value === null || typeof value === "string" || value instanceof Date;
            case "isActive":
                return typeof value === "boolean";
            default:
                return false;
        }
    });
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
    console.error(`Unexpected error while ${operation}:`, error);
    res.status(500).json({ error: "Internal server error" });
}
function buildAllowedStateError(current) {
    return {
        error: "State transition is not allowed",
        currentState: current,
    };
}
exports.serializedUnitsController = {
    list: async (req, res) => {
        const limit = req.query.limit === undefined ? 20 : parsePositiveInteger(req.query.limit);
        const offset = req.query.offset === undefined ? 0 : parseNonNegativeInteger(req.query.offset);
        const productId = req.query.productId === undefined ? undefined : parsePositiveInteger(req.query.productId);
        const state = typeof req.query.state === "string" ? req.query.state : undefined;
        if (limit === undefined ||
            limit < 1 ||
            limit > 100 ||
            offset === undefined ||
            offset < 0 ||
            (productId !== undefined && productId < 1) ||
            (state !== undefined && !VALID_STATES.includes(state))) {
            res.status(400).json({
                error: "Invalid query. Use positive integer productId and valid state values: IN_STOCK, SOLD, IN_SERVICE, RETIRED.",
            });
            return;
        }
        try {
            const where = {};
            if (productId !== undefined)
                where.productId = productId;
            if (state !== undefined)
                where.state = state;
            const result = await serialized_units_model_1.SerializedUnit.findAndCountAll({
                where,
                limit,
                offset,
                order: [["id", "DESC"]],
            });
            res.status(200).json({ items: result.rows, total: result.count, limit, offset });
        }
        catch (error) {
            sendError(res, error, "listing serialized units");
        }
    },
    getById: async (req, res) => {
        const id = parsePositiveInteger(req.params.id);
        if (id === undefined) {
            res.status(400).json({ error: "id must be a positive integer" });
            return;
        }
        try {
            const record = await serialized_units_model_1.SerializedUnit.findByPk(id);
            if (!record) {
                res.status(404).json({ error: "Record not found" });
                return;
            }
            res.status(200).json(record);
        }
        catch (error) {
            sendError(res, error, "retrieving a serialized unit");
        }
    },
    create: async (req, res) => {
        const body = validateBodyShape(req.body, ["productId", "serial", "state"]);
        if (!body || !hasValidValues(body)) {
            res.status(400).json({ error: "Invalid body, missing required fields, or unsupported fields" });
            return;
        }
        try {
            const created = await serialized_units_model_1.SerializedUnit.create({
                ...body,
                secondarySerial: body.secondarySerial ?? null,
                receivedAt: body.receivedAt ?? null,
            });
            res.status(201).json(created);
        }
        catch (error) {
            sendError(res, error, "creating a serialized unit");
        }
    },
    replace: async (req, res) => {
        const id = parsePositiveInteger(req.params.id);
        const body = validateBodyShape(req.body, ["productId", "serial", "state"]);
        if (id === undefined || !body || !hasValidValues(body)) {
            res.status(400).json({ error: "Invalid replacement body or unsupported fields" });
            return;
        }
        try {
            const record = await serialized_units_model_1.SerializedUnit.findByPk(id);
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
        }
        catch (error) {
            sendError(res, error, "replacing a serialized unit");
        }
    },
    update: async (req, res) => {
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
            const record = await serialized_units_model_1.SerializedUnit.findByPk(id);
            if (!record) {
                res.status(404).json({ error: "Record not found" });
                return;
            }
            record.set(body);
            await record.save();
            res.status(200).json(record);
        }
        catch (error) {
            sendError(res, error, "updating a serialized unit");
        }
    },
    remove: async (req, res) => {
        const id = parsePositiveInteger(req.params.id);
        if (id === undefined) {
            res.status(400).json({ error: "id must be a positive integer" });
            return;
        }
        try {
            const record = await serialized_units_model_1.SerializedUnit.findByPk(id);
            if (!record) {
                res.status(404).json({ error: "Record not found" });
                return;
            }
            record.set({ isActive: false });
            await record.save({ fields: ["isActive"] });
            res.status(200).json(record);
        }
        catch (error) {
            sendError(res, error, "deleting a serialized unit");
        }
    },
    sell: async (req, res) => {
        const id = parsePositiveInteger(req.params.id);
        if (id === undefined) {
            res.status(400).json({ error: "id must be a positive integer" });
            return;
        }
        try {
            const record = await serialized_units_model_1.SerializedUnit.findByPk(id);
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
        }
        catch (error) {
            sendError(res, error, "selling a serialized unit");
        }
    },
    service: async (req, res) => {
        const id = parsePositiveInteger(req.params.id);
        if (id === undefined) {
            res.status(400).json({ error: "id must be a positive integer" });
            return;
        }
        try {
            const record = await serialized_units_model_1.SerializedUnit.findByPk(id);
            if (!record) {
                res.status(404).json({ error: "Record not found" });
                return;
            }
            const validTransitions = {
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
        }
        catch (error) {
            sendError(res, error, "updating the service state of a serialized unit");
        }
    },
};
exports.default = exports.serializedUnitsController;
//# sourceMappingURL=serialized-units.controller.js.map