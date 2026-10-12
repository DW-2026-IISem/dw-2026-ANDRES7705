"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.associateProductsWithProductTypes = associateProductsWithProductTypes;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
const products_model_1 = require("../../features/businesses/products/products.model");
const product_types_model_1 = require("../../features/businesses/product-types/product-types.model");
const PRODUCT_TYPE_FK = "fk_products_product_type_id";
async function associateProductsWithProductTypes() {
    const queryInterface = db_1.sequelize.getQueryInterface();
    const productColumns = await queryInterface.describeTable("products");
    if (!productColumns.product_type_id) {
        await queryInterface.addColumn("products", "product_type_id", {
            type: "BIGINT",
            allowNull: true,
        });
    }
    if (!productColumns.stock_quantity) {
        await queryInterface.addColumn("products", "stock_quantity", {
            type: "INTEGER",
            allowNull: false,
            defaultValue: 0,
        });
    }
    const unassignedProducts = await db_1.sequelize.query("SELECT id, type FROM products WHERE product_type_id IS NULL", { type: sequelize_1.QueryTypes.SELECT });
    for (const legacyType of ["EQUIPMENT", "ACCESSORY"]) {
        const matchingProducts = unassignedProducts.filter((product) => product.type === legacyType);
        if (matchingProducts.length === 0)
            continue;
        const [productType] = await product_types_model_1.ProductType.findOrCreate({
            where: { name: legacyType, status: "active" },
            defaults: {
                name: legacyType,
                description: `Migrated from legacy Product.type=${legacyType}`,
                status: "active",
            },
        });
        await products_model_1.Product.update({ productTypeId: productType.id }, { where: { id: matchingProducts.map(({ id }) => id) } });
    }
    const remainingUnassigned = await products_model_1.Product.count({
        where: { productTypeId: null },
    });
    if (remainingUnassigned > 0) {
        throw new Error(`Cannot require product_type_id: ${remainingUnassigned} product(s) have no legacy type to migrate`);
    }
    const orphanedProductTypes = await db_1.sequelize.query(`SELECT products.id
     FROM products
     LEFT JOIN product_types ON product_types.id = products.product_type_id
     WHERE product_types.id IS NULL`, { type: sequelize_1.QueryTypes.SELECT });
    if (orphanedProductTypes.length > 0) {
        throw new Error(`Cannot add product type foreign key: ${orphanedProductTypes.length} product(s) reference a missing product type`);
    }
    const currentProductColumns = await queryInterface.describeTable("products");
    if (currentProductColumns.product_type_id.allowNull) {
        await queryInterface.changeColumn("products", "product_type_id", {
            type: "BIGINT",
            allowNull: false,
        });
    }
    const constraints = await db_1.sequelize.query(`SELECT CONSTRAINT_NAME AS constraint_name
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'products'
       AND COLUMN_NAME = 'product_type_id'
       AND REFERENCED_TABLE_NAME = 'product_types'`, { type: sequelize_1.QueryTypes.SELECT });
    if (constraints.length === 0) {
        await queryInterface.addConstraint("products", {
            fields: ["product_type_id"],
            type: "foreign key",
            name: PRODUCT_TYPE_FK,
            references: { table: "product_types", field: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        });
    }
    const saleDetailColumns = await queryInterface.describeTable("sale_details");
    if (!saleDetailColumns.is_active) {
        await queryInterface.addColumn("sale_details", "is_active", {
            type: "BOOLEAN",
            allowNull: false,
            defaultValue: true,
        });
    }
    const serializedUnitIndexes = await db_1.sequelize.query(`SELECT INDEX_NAME AS index_name,
            COUNT(*) AS column_count,
            MAX(CASE WHEN COLUMN_NAME = 'serialized_unit_id' THEN 1 ELSE 0 END) AS contains_serialized_unit_id,
            MAX(NON_UNIQUE) AS non_unique
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sale_details'
     GROUP BY INDEX_NAME`, { type: sequelize_1.QueryTypes.SELECT });
    const uniqueSerializedUnitIndexes = serializedUnitIndexes.filter((index) => index.index_name !== "PRIMARY" &&
        Number(index.non_unique) === 0 &&
        Number(index.column_count) === 1 &&
        Number(index.contains_serialized_unit_id) === 1);
    if (uniqueSerializedUnitIndexes.length > 0) {
        const hasNonUniqueSerializedUnitIndex = serializedUnitIndexes.some((index) => Number(index.non_unique) === 1 &&
            Number(index.column_count) === 1 &&
            Number(index.contains_serialized_unit_id) === 1);
        if (!hasNonUniqueSerializedUnitIndex) {
            await queryInterface.addIndex("sale_details", ["serialized_unit_id"], {
                name: "idx_sale_details_serialized_unit_id",
            });
        }
        for (const index of uniqueSerializedUnitIndexes) {
            await queryInterface.removeIndex("sale_details", index.index_name);
        }
    }
}
//# sourceMappingURL=associate-products-with-product-types.js.map