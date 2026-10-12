"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllSeeders = runAllSeeders;
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../../databases/db");
require("../../databases/models");
const customers_seeder_1 = require("../../features/businesses/customers/customers.seeder");
const product_types_seeder_1 = require("../../features/businesses/product-types/product-types.seeder");
const products_seeder_1 = require("../../features/businesses/products/products.seeder");
const sales_seeder_1 = require("../../features/businesses/sales/sales.seeder");
const sale_details_seeder_1 = require("../../features/businesses/sale-details/sale-details.seeder");
const associate_products_with_product_types_1 = require("../../databases/migrations/associate-products-with-product-types");
const counts_1 = require("./counts");
dotenv_1.default.config();
async function runAllSeeders() {
    const counts = (0, counts_1.resolveSeedCounts)();
    console.log("🌱 Iniciando SeedersRunner...");
    console.log("📊 Conteos:", counts);
    await (0, db_1.testConnection)();
    await db_1.sequelize.sync();
    await (0, associate_products_with_product_types_1.associateProductsWithProductTypes)();
    await (0, customers_seeder_1.seedCustomers)(counts.customers);
    await (0, product_types_seeder_1.seedProductTypes)(counts.product_types);
    await (0, products_seeder_1.seedProducts)(counts.products);
    await (0, sales_seeder_1.seedSales)(counts.sales);
    await (0, sale_details_seeder_1.seedSaleDetails)(counts.sale_details);
    console.log("🌱 SeedersRunner finalizado");
}
if (require.main === module) {
    runAllSeeders()
        .then(async () => {
        await db_1.sequelize.close();
        process.exit(0);
    })
        .catch(async (error) => {
        console.error("❌ Error en seeders:", error);
        await db_1.sequelize.close();
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map