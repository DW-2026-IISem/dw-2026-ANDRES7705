import { faker } from "@faker-js/faker";
import { ProductType } from "../product-types/product-types.model";
import { Product } from "./products.model";

export async function seedProducts(count: number): Promise<number> {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError("Product seed count must be a non-negative integer");
  }
  if (count === 0) {
    console.log("⏭️  products: count=0, se omite");
    return 0;
  }

  const existing = await Product.count();
  if (existing > 0) {
    console.log(`⏭️  products: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const types = await ProductType.findAll({ where: { status: "active" } });
  if (types.length === 0) {
    console.log("⏭️  products: no hay tipos de producto activos, se omite seeder");
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => {
    const productType = faker.helpers.arrayElement(types);
    return {
      sku: `SEED-${Date.now()}-${index}-${faker.string.alphanumeric(6).toUpperCase()}`,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      type: faker.helpers.arrayElement(["EQUIPMENT", "ACCESSORY"] as const),
      productTypeId: productType.id,
      brand: faker.company.name(),
      model: faker.commerce.productAdjective(),
      requiresSerial: faker.datatype.boolean(),
      cost: faker.commerce.price({ min: 5, max: 500, dec: 2 }),
      price: faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
      taxPercentage: 0,
      defaultWarrantyMonths: faker.number.int({ min: 0, max: 24 }),
      isActive: true,
    };
  });

  await Product.bulkCreate(rows);
  console.log(`✅ products: insertados ${count} registro(s) falsos`);
  return count;
}
