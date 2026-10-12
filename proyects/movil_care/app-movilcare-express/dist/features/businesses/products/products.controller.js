"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsController = void 0;
const crud_controller_1 = require("../shared/crud.controller");
const product_types_model_1 = require("../product-types/product-types.model");
const products_model_1 = require("./products.model");
const crudController = (0, crud_controller_1.createCrudController)(products_model_1.Product, {
    fields: [
        "sku",
        "name",
        "description",
        "type",
        "productTypeId",
        "stockQuantity",
        "brand",
        "model",
        "requiresSerial",
        "cost",
        "price",
        "taxPercentage",
        "defaultWarrantyMonths",
        "isActive",
    ],
    requiredFields: ["sku", "name", "type", "productTypeId", "price"],
    softDeleteField: "isActive",
});
function parseProductTypeId(value) {
    if ((typeof value !== "number" && typeof value !== "string") ||
        !/^[1-9]\d*$/.test(String(value))) {
        return undefined;
    }
    const id = Number(value);
    return Number.isSafeInteger(id) ? id : undefined;
}
async function validateActiveProductType(req, res, next, required) {
    const body = typeof req.body === "object" && req.body !== null && !Array.isArray(req.body)
        ? req.body
        : {};
    const rawId = body.productTypeId;
    if (rawId === undefined && !required) {
        next();
        return;
    }
    const productTypeId = parseProductTypeId(rawId);
    if (productTypeId === undefined) {
        res.status(400).json({ error: "productTypeId must be a positive integer" });
        return;
    }
    try {
        const productType = await product_types_model_1.ProductType.findByPk(productTypeId);
        if (!productType) {
            res.status(404).json({ error: "Product type not found" });
            return;
        }
        if (productType.status !== "active") {
            res.status(400).json({ error: "Product type must be active" });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Unexpected error while validating product type:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
exports.productsController = {
    ...crudController,
    list: async (req, res) => {
        const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
        const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
        if (!Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100 ||
            !Number.isInteger(offset) ||
            offset < 0) {
            res.status(400).json({
                error: "limit must be 1-100 and offset must be a non-negative integer",
            });
            return;
        }
        try {
            const result = await products_model_1.Product.findAndCountAll({
                where: { isActive: true },
                include: [{ model: product_types_model_1.ProductType, as: "productType" }],
                limit,
                offset,
                order: [["id", "ASC"]],
            });
            res.status(200).json({ items: result.rows, total: result.count, limit, offset });
        }
        catch (error) {
            console.error("Unexpected error while listing products:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    getById: async (req, res) => {
        const rawId = req.params.id;
        const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
        if (!Number.isSafeInteger(id) || id < 1) {
            res.status(400).json({ error: "id must be a positive integer" });
            return;
        }
        try {
            const product = await products_model_1.Product.findByPk(id, {
                include: [{ model: product_types_model_1.ProductType, as: "productType" }],
            });
            if (!product) {
                res.status(404).json({ error: "Product not found" });
                return;
            }
            res.status(200).json(product);
        }
        catch (error) {
            console.error("Unexpected error while retrieving product:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    validateProductTypeForCreate: (req, res, next) => validateActiveProductType(req, res, next, true),
    validateProductTypeForUpdate: (req, res, next) => validateActiveProductType(req, res, next, false),
    deletePhysical: async (req, res) => {
        const rawId = req.params.id;
        const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
        if (!Number.isSafeInteger(id) || id < 1) {
            res.status(400).json({ error: "id must be a positive integer" });
            return;
        }
        try {
            const product = await products_model_1.Product.findByPk(id);
            if (!product) {
                res.status(404).json({ error: "Product not found" });
                return;
            }
            await product.destroy();
            res.status(200).json({ message: "Product permanently deleted", id });
        }
        catch (error) {
            if (error instanceof Error &&
                "name" in error &&
                error.name === "SequelizeForeignKeyConstraintError") {
                res.status(409).json({ error: "Product is referenced by other records" });
                return;
            }
            console.error("Unexpected error while deleting product permanently:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    deactivate: async (req, res) => {
        const rawId = req.params.id;
        const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
        if (!Number.isSafeInteger(id) || id < 1) {
            res.status(400).json({ error: "id must be a positive integer" });
            return;
        }
        try {
            const product = await products_model_1.Product.findByPk(id);
            if (!product) {
                res.status(404).json({ error: "Product not found" });
                return;
            }
            await product.update({ isActive: false });
            res.status(200).json({ message: "Product deactivated", product });
        }
        catch (error) {
            console.error("Unexpected error while deactivating product:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
};
//# sourceMappingURL=products.controller.js.map