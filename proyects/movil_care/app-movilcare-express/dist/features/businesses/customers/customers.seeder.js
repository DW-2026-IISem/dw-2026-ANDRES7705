"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCustomers = seedCustomers;
const faker_1 = require("@faker-js/faker");
const customers_model_1 = require("./customers.model");
const CUSTOMER_DOCUMENT_TYPES = [
    "CC",
    "CE",
    "NIT",
    "PASSPORT",
    "TI",
];
async function seedCustomers(count) {
    if (!Number.isSafeInteger(count) || count < 0) {
        throw new RangeError("Customer seed count must be a non-negative integer");
    }
    if (count === 0) {
        console.log("⏭️  customers: count=0, se omite");
        return 0;
    }
    const existing = await customers_model_1.Customer.count();
    if (existing > 0) {
        console.log(`⏭️  customers: ya hay ${existing} registro(s), se omite seeder`);
        return 0;
    }
    const rows = Array.from({ length: count }, (_, index) => {
        const firstName = faker_1.faker.person.firstName();
        const lastName = faker_1.faker.person.lastName();
        return {
            documentType: faker_1.faker.helpers.arrayElement(CUSTOMER_DOCUMENT_TYPES),
            documentNumber: `${faker_1.faker.string.numeric(14)}${String(index).padStart(6, "0")}`,
            firstName,
            lastName,
            companyName: null,
            phone: faker_1.faker.string.numeric(10),
            email: `customer.${index}.${faker_1.faker.string.alphanumeric(8).toLowerCase()}@example.com`,
            address: faker_1.faker.location.streetAddress(),
            isActive: true,
        };
    });
    await customers_model_1.Customer.bulkCreate(rows);
    console.log(`✅ customers: insertados ${count} registro(s) falsos`);
    return count;
}
//# sourceMappingURL=customers.seeder.js.map