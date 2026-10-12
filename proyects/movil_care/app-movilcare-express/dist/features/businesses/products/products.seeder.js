"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProducts = seedProducts;
const faker_1 = require("@faker-js/faker");
const product_types_model_1 = require("../product-types/product-types.model");
const products_model_1 = require("./products.model");
async function seedProducts(count) {
    if (!Number.isSafeInteger(count) || count < 0) {
        throw new RangeError("Product seed count must be a non-negative integer");
    }
    if (count === 0) {
        console.log("⏭️  products: count=0, se omite");
        return 0;
    }
    const existing = await products_model_1.Product.count();
    if (existing > 0) {
        console.log(`⏭️  products: ya hay ${existing} registro(s), se omite seeder`);
        return 0;
    }
    const types = await product_types_model_1.ProductType.findAll({ where: { status: "active" } });
    if (types.length === 0) {
        console.log("⏭️  products: no hay tipos de producto activos, se omite seeder");
        return 0;
    }
    const rows = Array.from({ length: count }, (_, index) => {
        const productType = faker_1.faker.helpers.arrayElement(types);
        const requiresSerial = faker_1.faker.datatype.boolean();
        return {
            sku: `SEED-${Date.now()}-${index}-${faker_1.faker.string.alphanumeric(6).toUpperCase()}`,
            name: faker_1.faker.commerce.productName(),
            description: faker_1.faker.commerce.productDescription(),
            type: faker_1.faker.helpers.arrayElement(["EQUIPMENT", "ACCESSORY"]),
            productTypeId: productType.id,
            brand: faker_1.faker.company.name(),
            model: faker_1.faker.commerce.productAdjective(),
            requiresSerial,
            stockQuantity: requiresSerial ? 0 : faker_1.faker.number.int({ min: 5, max: 50 }),
            cost: faker_1.faker.commerce.price({ min: 5, max: 500, dec: 2 }),
            price: faker_1.faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
            taxPercentage: 0,
            defaultWarrantyMonths: faker_1.faker.number.int({ min: 0, max: 24 }),
            isActive: true,
        };
    });
    await products_model_1.Product.bulkCreate(rows);
    console.log(`✅ products: insertados ${count} registro(s) falsos`);
    return count;
}
//# sourceMappingURL=products.seeder.js.map