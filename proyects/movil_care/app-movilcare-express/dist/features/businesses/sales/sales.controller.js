"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesController = void 0;
const db_1 = require("../../../databases/db");
const customers_model_1 = require("../customers/customers.model");
const products_model_1 = require("../products/products.model");
const sale_details_model_1 = require("../sale-details/sale-details.model");
const serialized_units_model_1 = require("../serialized-units/serialized-units.model");
const crud_controller_1 = require("../shared/crud.controller");
const sales_model_1 = require("./sales.model");
const parseInteger = (value) => {
    if (typeof value !== "string" || !/^\d+$/.test(value))
        return undefined;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : undefined;
};
exports.salesController = {
    ...(0, crud_controller_1.createCrudController)(sales_model_1.Sale, {
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
    confirm: async (req, res) => {
        const saleId = parseInteger(req.params.id);
        if (saleId === undefined || saleId < 1) {
            res.status(400).json({ error: "id must be a positive integer" });
            return;
        }
        const transaction = await db_1.sequelize.transaction();
        try {
            const sale = await sales_model_1.Sale.findByPk(saleId, {
                transaction,
                include: [
                    {
                        model: sale_details_model_1.SaleDetail,
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
            const customer = await customers_model_1.Customer.findByPk(sale.customerId, { transaction });
            if (!customer || !customer.isActive) {
                throw new Error("Customer is inactive or does not exist");
            }
            const details = sale.get("saleDetails");
            if (!details || details.length === 0) {
                throw new Error("A sale must contain at least one detail");
            }
            let subtotal = 0;
            let discount = 0;
            let taxes = 0;
            for (const detail of details) {
                const product = await products_model_1.Product.findByPk(detail.productId, { transaction });
                if (!product || !product.isActive) {
                    throw new Error(`Product ${detail.productId} is inactive or missing`);
                }
                const lineSubtotal = Number(detail.quantity) * Number(detail.unitPrice);
                const lineDiscount = Number(detail.discount || 0);
                const taxPercentage = Number(detail.taxPercentage ?? product.taxPercentage ?? 0);
                const lineTaxes = ((lineSubtotal - lineDiscount) * taxPercentage) / 100;
                const lineTotal = lineSubtotal - lineDiscount + lineTaxes;
                await detail.update({
                    total: Number(lineTotal).toFixed(2),
                    taxPercentage: Number(taxPercentage).toFixed(2),
                }, { transaction });
                if (product.requiresSerial) {
                    if (detail.quantity !== 1) {
                        throw new Error(`Product ${product.name} requires quantity 1 when serialized`);
                    }
                    if (detail.serializedUnitId === null || detail.serializedUnitId === undefined) {
                        throw new Error(`Product ${product.name} requires a serialized unit`);
                    }
                    const serializedUnit = await serialized_units_model_1.SerializedUnit.findByPk(detail.serializedUnitId, {
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
            await sale.update({
                subtotal: Number(subtotal).toFixed(2),
                discount: Number(discount).toFixed(2),
                taxes: Number(taxes).toFixed(2),
                total: Number(total).toFixed(2),
                state: "CONFIRMED",
            }, { transaction });
            await transaction.commit();
            const refreshedSale = await sales_model_1.Sale.findByPk(saleId, {
                include: [
                    {
                        model: sale_details_model_1.SaleDetail,
                        as: "saleDetails",
                    },
                ],
            });
            res.status(200).json({ message: "Sale confirmed successfully", sale: refreshedSale });
        }
        catch (error) {
            await transaction.rollback();
            const message = error instanceof Error ? error.message : "Unable to confirm sale";
            res.status(400).json({ error: message });
        }
    },
};
exports.default = exports.salesController;
//# sourceMappingURL=sales.controller.js.map