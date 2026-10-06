"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCrudController = createCrudController;
const sequelize_1 = require("sequelize");
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function parseInteger(value) {
    if (typeof value !== "string" || !/^\d+$/.test(value))
        return undefined;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : undefined;
}
function hasValidAttributeValues(model, body) {
    return Object.entries(body).every(([field, value]) => {
        const attribute = model.rawAttributes[field];
        if (value === null)
            return attribute.allowNull === true;
        const typeName = typeof attribute.type === "string" ? attribute.type : attribute.type.key;
        switch (typeName) {
            case "STRING":
            case "VARCHAR":
            case "TEXT":
            case "ENUM":
                return typeof value === "string";
            case "BOOLEAN":
                return typeof value === "boolean";
            case "INTEGER":
            case "SMALLINT":
                return typeof value === "number" && Number.isInteger(value);
            case "BIGINT":
                return ((typeof value === "number" && Number.isSafeInteger(value)) ||
                    (typeof value === "string" && /^\d+$/.test(value) && Number.isSafeInteger(Number(value))));
            case "DATE":
            case "DATEONLY":
                return (value instanceof Date && Number.isFinite(value.getTime())) || (typeof value === "string" &&
                    value.trim().length > 0 &&
                    Number.isFinite(Date.parse(value)));
            case "DECIMAL":
                return ((typeof value === "number" && Number.isFinite(value)) ||
                    (typeof value === "string" && /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)));
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
function createCrudController(model, options) {
    const editableFields = new Set(options.fields);
    function readBody(body, requiredFields) {
        if (!isRecord(body))
            return undefined;
        const keys = Object.keys(body);
        if (keys.length === 0 || keys.some((key) => !editableFields.has(key))) {
            return undefined;
        }
        if (requiredFields.some((field) => !Object.prototype.hasOwnProperty.call(body, field))) {
            return undefined;
        }
        return body;
    }
    return {
        list: async (req, res) => {
            const limit = req.query.limit === undefined ? 20 : parseInteger(req.query.limit);
            const offset = req.query.offset === undefined ? 0 : parseInteger(req.query.offset);
            if (limit === undefined ||
                limit < 1 ||
                limit > 100 ||
                offset === undefined ||
                offset < 0) {
                res.status(400).json({ error: "limit must be 1-100 and offset must be a non-negative integer" });
                return;
            }
            try {
                const result = await model.findAndCountAll({ limit, offset });
                res.status(200).json({ items: result.rows, total: result.count, limit, offset });
            }
            catch (error) {
                sendError(res, error, "listing records");
            }
        },
        getById: async (req, res) => {
            const id = parseInteger(req.params.id);
            if (id === undefined || id < 1) {
                res.status(400).json({ error: "id must be a positive integer" });
                return;
            }
            try {
                const record = await model.findByPk(id);
                if (!record) {
                    res.status(404).json({ error: "Record not found" });
                    return;
                }
                res.status(200).json(record);
            }
            catch (error) {
                sendError(res, error, "retrieving a record");
            }
        },
        create: async (req, res) => {
            const body = readBody(req.body, options.requiredFields);
            if (!body || !hasValidAttributeValues(model, body)) {
                res.status(400).json({ error: "Invalid body, missing required fields, or unsupported fields" });
                return;
            }
            try {
                const record = await model.create(body);
                res.status(201).json(record);
            }
            catch (error) {
                sendError(res, error, "creating a record");
            }
        },
        replace: async (req, res) => {
            const id = parseInteger(req.params.id);
            const body = readBody(req.body, options.requiredFields);
            if (id === undefined || id < 1) {
                res.status(400).json({ error: "id must be a positive integer" });
                return;
            }
            if (!body) {
                res.status(400).json({ error: "Invalid replacement body or unsupported fields" });
                return;
            }
            if (!hasValidAttributeValues(model, body)) {
                res.status(400).json({ error: "Invalid replacement body or unsupported fields" });
                return;
            }
            try {
                const record = await model.findByPk(id);
                if (!record) {
                    res.status(404).json({ error: "Record not found" });
                    return;
                }
                const replacement = Object.fromEntries(options.fields.map((field) => [
                    field,
                    Object.prototype.hasOwnProperty.call(body, field)
                        ? body[field]
                        : model.rawAttributes[field]?.defaultValue ?? null,
                ]));
                record.set(replacement);
                await record.save();
                res.status(200).json(record);
            }
            catch (error) {
                sendError(res, error, "replacing a record");
            }
        },
        update: async (req, res) => {
            const id = parseInteger(req.params.id);
            const body = readBody(req.body, []);
            if (id === undefined || id < 1) {
                res.status(400).json({ error: "id must be a positive integer" });
                return;
            }
            if (!body) {
                res.status(400).json({ error: "Invalid patch body or unsupported fields" });
                return;
            }
            if (!hasValidAttributeValues(model, body)) {
                res.status(400).json({ error: "Invalid patch body or unsupported fields" });
                return;
            }
            try {
                const record = await model.findByPk(id);
                if (!record) {
                    res.status(404).json({ error: "Record not found" });
                    return;
                }
                record.set(body);
                await record.save();
                res.status(200).json(record);
            }
            catch (error) {
                sendError(res, error, "updating a record");
            }
        },
        remove: async (req, res) => {
            const id = parseInteger(req.params.id);
            if (id === undefined || id < 1) {
                res.status(400).json({ error: "id must be a positive integer" });
                return;
            }
            try {
                const record = await model.findByPk(id);
                if (!record) {
                    res.status(404).json({ error: "Record not found" });
                    return;
                }
                if (options.softDeleteField) {
                    record.set({ [options.softDeleteField]: false });
                    await record.save({ fields: [options.softDeleteField] });
                }
                else {
                    await record.destroy();
                }
                res.status(200).json(record);
            }
            catch (error) {
                sendError(res, error, "deleting a record");
            }
        },
    };
}
//# sourceMappingURL=crud.controller.js.map