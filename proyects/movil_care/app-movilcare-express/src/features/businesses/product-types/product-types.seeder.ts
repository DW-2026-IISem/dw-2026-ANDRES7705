import { faker } from "@faker-js/faker";
import { ProductType } from "./product-types.model";

export async function seedProductTypes(count: number): Promise<number> {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError("Product type seed count must be a non-negative integer");
  }
  if (count === 0) {
    console.log("⏭️  product_types: count=0, se omite");
    return 0;
  }

  const existing = await ProductType.count();
  if (existing > 0) {
    console.log(`⏭️  product_types: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const rows = Array.from({ length: count }, () => ({
    name: faker.commerce.department(),
    description: faker.commerce.productDescription(),
    status: "active" as const,
  }));

  await ProductType.bulkCreate(rows);
  console.log(`✅ product_types: insertados ${count} registro(s) falsos`);
  return count;
}
