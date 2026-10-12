import { faker } from "@faker-js/faker";
import { Customer } from "../customers/customers.model";
import { Sale } from "./sales.model";

export async function seedSales(count: number): Promise<number> {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError("Sales seed count must be a non-negative integer");
  }
  if (count === 0) {
    console.log("⏭️  sales: count=0, se omite");
    return 0;
  }

  const existing = await Sale.count();
  if (existing > 0) {
    console.log(`⏭️  sales: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const customers = await Customer.findAll({ where: { isActive: true } });
  if (customers.length === 0) {
    console.log("⏭️  sales: no hay customers activos, se omite seeder");
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => {
    const customer = faker.helpers.arrayElement(customers);
    return {
      number: `S${Date.now().toString(36).toUpperCase()}${index.toString(36).toUpperCase()}`.slice(0, 20),
      customerId: customer.id,
      sellerId: null,
      soldAt: faker.date.recent({ days: 30 }),
      subtotal: 0,
      taxes: 0,
      discount: 0,
      total: 0,
      state: "DRAFT" as const,
    };
  });

  await Sale.bulkCreate(rows);
  console.log(`✅ sales: insertados ${count} borrador(es)`);
  return count;
}
