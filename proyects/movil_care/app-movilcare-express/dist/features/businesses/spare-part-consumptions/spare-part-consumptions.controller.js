"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sparePartConsumptionsController = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../../../databases/db");
const spare_parts_model_1 = require("../spare-parts/spare-parts.model");
const spare_part_consumptions_model_1 = require("./spare-part-consumptions.model");
const fields = [
    "serviceOrderId",
    "sparePartId",
    "quantity",
    "unitCost",
    "totalCost",
    "observations",
];
const requiredFields = [
    "serviceOrderId",
    "sparePartId",
    "quantity",
    "unitCost",
    "totalCost",
];
function readBody(value, required) {
    if (typeof value !== "object" ||
        value === null ||
        Array.isArray(value)) {
        return undefined;
    }
    const body = value;
    const keys = Object.keys(body);
    if (keys.length === 0 ||
        keys.some((key) => !fields.includes(key)) ||
        required.some((key) => !Object.prototype.hasOwnProperty.call(body, key))) {
        return undefined;
    }
    for (const key of ["serviceOrderId", "sparePartId", "quantity"]) {
        if (body[key] !== undefined &&
            (typeof body[key] !== "number" ||
                !Number.isSafeInteger(body[key]) ||
                body[key] < 1)) {
            return undefined;
        }
    }
    for (const key of ["unitCost", "totalCost"]) {
        if (body[key] !== undefined &&
            (typeof body[key] !== "number" ||
                !Number.isFinite(body[key]) ||
                body[key] < 0)) {
            return undefined;
        }
    }
    if (body.observations !== undefined &&
        body.observations !== null &&
        typeof body.observations !== "string") {
        return undefined;
    }
    return body;
}
function sendError(res, error) {
    if (error instanceof sequelize_1.UniqueConstraintError) {
        res.status(409).json({ error: "Ya existe un registro con esos valores" });
        return;
    }
    if (error instanceof sequelize_1.ValidationError) {
        res.status(400).json({
            error: "Error de validación",
            details: error.errors.map(({ path, message }) => ({
                field: path,
                message,
            })),
        });
        return;
    }
    if (error instanceof sequelize_1.ForeignKeyConstraintError) {
        res.status(400).json({
            error: "La orden de servicio o el repuesto no existe",
        });
        return;
    }
    console.error("Error en consumos de repuestos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
}
function getId(value) {
    if (typeof value !== "string" || !/^\d+$/.test(value)) {
        return undefined;
    }
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}
async function getLockedSparePart(id, transaction) {
    return spare_parts_model_1.SparePart.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
    });
}
async function changeStock(sparePart, difference, transaction) {
    const currentStock = Number(sparePart.currentStock);
    const newStock = currentStock + difference;
    if (!Number.isSafeInteger(newStock) || newStock < 0) {
        throw new Error("STOCK_INSUFFICIENT");
    }
    await sparePart.update({ currentStock: newStock }, { transaction });
}
function validateTotal(body) {
    if (body.quantity === undefined ||
        body.unitCost === undefined ||
        body.totalCost === undefined) {
        return true;
    }
    return (Math.abs(body.totalCost - body.quantity * body.unitCost) <= 0.01);
}
exports.sparePartConsumptionsController = {
    list: async (_req, res) => {
        try {
            const limitValue = _req.query.limit;
            const offsetValue = _req.query.offset;
            const limit = limitValue === undefined ? 20 : Number(limitValue);
            const offset = offsetValue === undefined ? 0 : Number(offsetValue);
            if (!Number.isInteger(limit) ||
                limit < 1 ||
                limit > 100 ||
                !Number.isInteger(offset) ||
                offset < 0) {
                res.status(400).json({
                    error: "limit debe estar entre 1 y 100 y offset debe ser >= 0",
                });
                return;
            }
            const result = await spare_part_consumptions_model_1.SparePartConsumption.findAndCountAll({
                limit,
                offset,
            });
            res.status(200).json({
                items: result.rows,
                total: result.count,
                limit,
                offset,
            });
        }
        catch (error) {
            sendError(res, error);
        }
    },
    getById: async (req, res) => {
        const id = getId(req.params.id);
        if (!id) {
            res.status(400).json({ error: "El ID debe ser un entero positivo" });
            return;
        }
        try {
            const record = await spare_part_consumptions_model_1.SparePartConsumption.findByPk(id);
            if (!record) {
                res.status(404).json({ error: "Consumo no encontrado" });
                return;
            }
            res.status(200).json(record);
        }
        catch (error) {
            sendError(res, error);
        }
    },
    create: async (req, res) => {
        const body = readBody(req.body, requiredFields);
        if (!body || !validateTotal(body)) {
            res.status(400).json({
                error: "Datos inválidos o totalCost no coincide con quantity * unitCost",
            });
            return;
        }
        try {
            const record = await db_1.sequelize.transaction(async (transaction) => {
                const sparePart = await getLockedSparePart(body.sparePartId, transaction);
                if (!sparePart) {
                    throw new Error("SPARE_PART_NOT_FOUND");
                }
                if (!sparePart.isActive) {
                    throw new Error("SPARE_PART_INACTIVE");
                }
                if (Number(sparePart.currentStock) < body.quantity) {
                    throw new Error("STOCK_INSUFFICIENT");
                }
                const consumption = await spare_part_consumptions_model_1.SparePartConsumption.create({
                    serviceOrderId: body.serviceOrderId,
                    sparePartId: body.sparePartId,
                    quantity: body.quantity,
                    unitCost: body.unitCost,
                    totalCost: body.totalCost,
                    observations: body.observations ?? null,
                }, { transaction });
                await changeStock(sparePart, -body.quantity, transaction);
                return consumption;
            });
            res.status(201).json(record);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "STOCK_INSUFFICIENT") {
                    res.status(409).json({ error: "Stock insuficiente para este consumo" });
                    return;
                }
                if (error.message === "SPARE_PART_NOT_FOUND") {
                    res.status(404).json({ error: "Repuesto no encontrado" });
                    return;
                }
                if (error.message === "SPARE_PART_INACTIVE") {
                    res.status(400).json({ error: "El repuesto está inactivo" });
                    return;
                }
            }
            sendError(res, error);
        }
    },
    replace: async (req, res) => {
        const id = getId(req.params.id);
        const body = readBody(req.body, requiredFields);
        if (!id || !body || !validateTotal(body)) {
            res.status(400).json({
                error: "Envía todos los campos requeridos y un totalCost correcto",
            });
            return;
        }
        try {
            const record = await db_1.sequelize.transaction(async (transaction) => {
                const current = await spare_part_consumptions_model_1.SparePartConsumption.findByPk(id, {
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });
                if (!current)
                    throw new Error("CONSUMPTION_NOT_FOUND");
                const oldPartId = Number(current.sparePartId);
                const newPartId = body.sparePartId;
                const partIds = [...new Set([oldPartId, newPartId])].sort((a, b) => a - b);
                const lockedParts = new Map();
                for (const partId of partIds) {
                    const part = await getLockedSparePart(partId, transaction);
                    if (!part)
                        throw new Error("SPARE_PART_NOT_FOUND");
                    lockedParts.set(partId, part);
                }
                const oldPart = lockedParts.get(oldPartId);
                const newPart = lockedParts.get(newPartId);
                const oldQuantity = Number(current.quantity);
                const newQuantity = body.quantity;
                if (!newPart.isActive)
                    throw new Error("SPARE_PART_INACTIVE");
                if (oldPartId === newPartId) {
                    const availableAfterRestore = Number(oldPart.currentStock) + oldQuantity;
                    if (availableAfterRestore < newQuantity) {
                        throw new Error("STOCK_INSUFFICIENT");
                    }
                    await changeStock(oldPart, oldQuantity - newQuantity, transaction);
                }
                else {
                    if (Number(newPart.currentStock) < newQuantity) {
                        throw new Error("STOCK_INSUFFICIENT");
                    }
                    await changeStock(oldPart, oldQuantity, transaction);
                    await changeStock(newPart, -newQuantity, transaction);
                }
                await current.update({
                    serviceOrderId: body.serviceOrderId,
                    sparePartId: newPartId,
                    quantity: newQuantity,
                    unitCost: body.unitCost,
                    totalCost: body.totalCost,
                    observations: body.observations ?? null,
                }, { transaction });
                return current;
            });
            res.status(200).json(record);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "CONSUMPTION_NOT_FOUND") {
                    res.status(404).json({ error: "Consumo no encontrado" });
                    return;
                }
                if (error.message === "STOCK_INSUFFICIENT") {
                    res.status(409).json({ error: "Stock insuficiente para este consumo" });
                    return;
                }
                if (error.message === "SPARE_PART_NOT_FOUND") {
                    res.status(404).json({ error: "Repuesto no encontrado" });
                    return;
                }
                if (error.message === "SPARE_PART_INACTIVE") {
                    res.status(400).json({ error: "El repuesto está inactivo" });
                    return;
                }
            }
            sendError(res, error);
        }
    },
    update: async (req, res) => {
        const id = getId(req.params.id);
        const body = readBody(req.body, []);
        if (!id || !body) {
            res.status(400).json({ error: "Datos de actualización inválidos" });
            return;
        }
        try {
            const record = await db_1.sequelize.transaction(async (transaction) => {
                const current = await spare_part_consumptions_model_1.SparePartConsumption.findByPk(id, {
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });
                if (!current)
                    throw new Error("CONSUMPTION_NOT_FOUND");
                const merged = {
                    serviceOrderId: body.serviceOrderId ?? Number(current.serviceOrderId),
                    sparePartId: body.sparePartId ?? Number(current.sparePartId),
                    quantity: body.quantity ?? Number(current.quantity),
                    unitCost: body.unitCost ?? Number(current.unitCost),
                    totalCost: body.totalCost ?? Number(current.totalCost),
                    observations: body.observations === undefined
                        ? current.observations
                        : body.observations,
                };
                if (!validateTotal(merged)) {
                    throw new Error("TOTAL_MISMATCH");
                }
                const oldPartId = Number(current.sparePartId);
                const newPartId = merged.sparePartId;
                const partIds = [...new Set([oldPartId, newPartId])].sort((a, b) => a - b);
                const lockedParts = new Map();
                for (const partId of partIds) {
                    const part = await getLockedSparePart(partId, transaction);
                    if (!part)
                        throw new Error("SPARE_PART_NOT_FOUND");
                    lockedParts.set(partId, part);
                }
                const oldPart = lockedParts.get(oldPartId);
                const newPart = lockedParts.get(newPartId);
                const oldQuantity = Number(current.quantity);
                const newQuantity = merged.quantity;
                if (newQuantity < 1 || !Number.isSafeInteger(newQuantity)) {
                    throw new Error("INVALID_QUANTITY");
                }
                if (!newPart.isActive)
                    throw new Error("SPARE_PART_INACTIVE");
                if (oldPartId === newPartId) {
                    if (Number(oldPart.currentStock) + oldQuantity < newQuantity) {
                        throw new Error("STOCK_INSUFFICIENT");
                    }
                    await changeStock(oldPart, oldQuantity - newQuantity, transaction);
                }
                else {
                    if (Number(newPart.currentStock) < newQuantity) {
                        throw new Error("STOCK_INSUFFICIENT");
                    }
                    await changeStock(oldPart, oldQuantity, transaction);
                    await changeStock(newPart, -newQuantity, transaction);
                }
                await current.update(merged, { transaction });
                return current;
            });
            res.status(200).json(record);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "CONSUMPTION_NOT_FOUND") {
                    res.status(404).json({ error: "Consumo no encontrado" });
                    return;
                }
                if (error.message === "STOCK_INSUFFICIENT") {
                    res.status(409).json({ error: "Stock insuficiente para este consumo" });
                    return;
                }
                if (error.message === "SPARE_PART_NOT_FOUND") {
                    res.status(404).json({ error: "Repuesto no encontrado" });
                    return;
                }
                if (error.message === "SPARE_PART_INACTIVE") {
                    res.status(400).json({ error: "El repuesto está inactivo" });
                    return;
                }
                if (error.message === "TOTAL_MISMATCH") {
                    res.status(400).json({
                        error: "totalCost debe ser quantity multiplicado por unitCost",
                    });
                    return;
                }
                if (error.message === "INVALID_QUANTITY") {
                    res.status(400).json({ error: "La cantidad debe ser un entero positivo" });
                    return;
                }
            }
            sendError(res, error);
        }
    },
    remove: async (req, res) => {
        const id = getId(req.params.id);
        if (!id) {
            res.status(400).json({ error: "El ID debe ser un entero positivo" });
            return;
        }
        try {
            const deleted = await db_1.sequelize.transaction(async (transaction) => {
                const current = await spare_part_consumptions_model_1.SparePartConsumption.findByPk(id, {
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });
                if (!current)
                    throw new Error("CONSUMPTION_NOT_FOUND");
                const sparePart = await getLockedSparePart(Number(current.sparePartId), transaction);
                if (!sparePart)
                    throw new Error("SPARE_PART_NOT_FOUND");
                await changeStock(sparePart, Number(current.quantity), transaction);
                const result = current.toJSON();
                await current.destroy({ transaction });
                return result;
            });
            res.status(200).json(deleted);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "CONSUMPTION_NOT_FOUND") {
                    res.status(404).json({ error: "Consumo no encontrado" });
                    return;
                }
                if (error.message === "SPARE_PART_NOT_FOUND") {
                    res.status(404).json({ error: "Repuesto no encontrado" });
                    return;
                }
            }
            sendError(res, error);
        }
    },
};
//# sourceMappingURL=spare-part-consumptions.controller.js.map