"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsController = void 0;
const crud_controller_1 = require("../shared/crud.controller");
const payments_model_1 = require("./payments.model");
const sales_model_1 = require("../sales/sales.model");
const service_orders_model_1 = require("../service-orders/service-orders.model");
const crud = (0, crud_controller_1.createCrudController)(payments_model_1.Payment, {
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
exports.paymentsController = {
    ...crud,
    create: async (req, res) => {
        const body = req.body;
        if (typeof body !== "object" ||
            body === null ||
            Array.isArray(body)) {
            res.status(400).json({ error: "Invalid request body" });
            return;
        }
        const data = body;
        const referenceType = data.referenceType;
        const referenceId = data.referenceId;
        if (!["SALE", "SERVICE_ORDER"].includes(String(referenceType))) {
            res.status(400).json({
                error: "referenceType must be SALE or SERVICE_ORDER",
            });
            return;
        }
        const id = typeof referenceId === "number"
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
            const referencedRecord = referenceType === "SALE"
                ? await sales_model_1.Sale.findByPk(id)
                : await service_orders_model_1.ServiceOrder.findByPk(id);
            if (!referencedRecord) {
                res.status(400).json({
                    error: "The referenced sale or service order does not exist",
                });
                return;
            }
            await crud.create(req, res);
        }
        catch (error) {
            console.error("Error validating payment reference:", error);
            res.status(500).json({
                error: "Internal server error",
            });
        }
    },
};
//# sourceMappingURL=payments.controller.js.map