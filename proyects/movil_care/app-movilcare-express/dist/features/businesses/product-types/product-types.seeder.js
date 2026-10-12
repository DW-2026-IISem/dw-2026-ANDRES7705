"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProductTypes = seedProductTypes;
const faker_1 = require("@faker-js/faker");
const product_types_model_1 = require("./product-types.model");
async function seedProductTypes(count) {
    if (!Number.isSafeInteger(count) || count < 0) {
        throw new RangeError("Product type seed count must be a non-negative integer");
    }
    if (count === 0) {
        console.log("⏭️  product_types: count=0, se omite");
        return 0;
    }
    const existing = await product_types_model_1.ProductType.count();
    if (existing > 0) {
        console.log(`⏭️  product_types: ya hay ${existing} registro(s), se omite seeder`);
        return 0;
    }
    const rows = Array.from({ length: count }, () => ({
        name: faker_1.faker.commerce.department(),
        description: faker_1.faker.commerce.productDescription(),
        status: "active",
    }));
    await product_types_model_1.ProductType.bulkCreate(rows);
    console.log(`✅ product_types: insertados ${count} registro(s) falsos`);
    return count;
}
//# sourceMappingURL=product-types.seeder.js.map