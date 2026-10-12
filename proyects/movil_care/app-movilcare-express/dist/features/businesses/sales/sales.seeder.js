"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSales = seedSales;
const faker_1 = require("@faker-js/faker");
const customers_model_1 = require("../customers/customers.model");
const sales_model_1 = require("./sales.model");
async function seedSales(count) {
    if (!Number.isSafeInteger(count) || count < 0) {
        throw new RangeError("Sales seed count must be a non-negative integer");
    }
    if (count === 0) {
        console.log("⏭️  sales: count=0, se omite");
        return 0;
    }
    const existing = await sales_model_1.Sale.count();
    if (existing > 0) {
        console.log(`⏭️  sales: ya hay ${existing} registro(s), se omite seeder`);
        return 0;
    }
    const customers = await customers_model_1.Customer.findAll({ where: { isActive: true } });
    if (customers.length === 0) {
        console.log("⏭️  sales: no hay customers activos, se omite seeder");
        return 0;
    }
    const rows = Array.from({ length: count }, (_, index) => {
        const customer = faker_1.faker.helpers.arrayElement(customers);
        return {
            number: `S${Date.now().toString(36).toUpperCase()}${index.toString(36).toUpperCase()}`.slice(0, 20),
            customerId: customer.id,
            sellerId: null,
            soldAt: faker_1.faker.date.recent({ days: 30 }),
            subtotal: 0,
            taxes: 0,
            discount: 0,
            total: 0,
            state: "DRAFT",
        };
    });
    await sales_model_1.Sale.bulkCreate(rows);
    console.log(`✅ sales: insertados ${count} borrador(es)`);
    return count;
}
//# sourceMappingURL=sales.seeder.js.map