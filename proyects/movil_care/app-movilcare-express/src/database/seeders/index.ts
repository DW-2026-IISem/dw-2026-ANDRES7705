import dotenv from "dotenv";
import { sequelize, testConnection } from "../../databases/db";
import "../../databases/models";
import { seedCustomers } from "../../features/businesses/customers/customers.seeder";
import { seedProductTypes } from "../../features/businesses/product-types/product-types.seeder";
import { seedProducts } from "../../features/businesses/products/products.seeder";
import { associateProductsWithProductTypes } from "../../databases/migrations/associate-products-with-product-types";
import { resolveSeedCounts } from "./counts";

dotenv.config();

export async function runAllSeeders(): Promise<void> {
  const counts = resolveSeedCounts();
  console.log("🌱 Iniciando SeedersRunner...");
  console.log("📊 Conteos:", counts);

  await testConnection();
  await sequelize.sync();
  await associateProductsWithProductTypes();

  await seedCustomers(counts.customers);
  await seedProductTypes(counts.product_types);
  await seedProducts(counts.products);

  console.log("🌱 SeedersRunner finalizado");
}

if (require.main === module) {
  runAllSeeders()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error: unknown) => {
      console.error("❌ Error en seeders:", error);
      await sequelize.close();
      process.exit(1);
    });
}
