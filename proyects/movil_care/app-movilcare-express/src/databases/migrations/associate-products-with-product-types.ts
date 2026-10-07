import { QueryTypes } from "sequelize";
import { sequelize } from "../db";
import { Product } from "../../features/businesses/products/products.model";
import { ProductType } from "../../features/businesses/product-types/product-types.model";

type LegacyProduct = {
  id: number;
  type: "EQUIPMENT" | "ACCESSORY";
};

type ConstraintRow = {
  constraint_name: string;
};

const PRODUCT_TYPE_FK = "fk_products_product_type_id";

export async function associateProductsWithProductTypes(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const productColumns = await queryInterface.describeTable("products");

  if (!productColumns.product_type_id) {
    await queryInterface.addColumn("products", "product_type_id", {
      type: "BIGINT",
      allowNull: true,
    });
  }

  const unassignedProducts = await sequelize.query<LegacyProduct>(
    "SELECT id, type FROM products WHERE product_type_id IS NULL",
    { type: QueryTypes.SELECT }
  );

  for (const legacyType of ["EQUIPMENT", "ACCESSORY"] as const) {
    const matchingProducts = unassignedProducts.filter(
      (product) => product.type === legacyType
    );
    if (matchingProducts.length === 0) continue;

    const [productType] = await ProductType.findOrCreate({
      where: { name: legacyType, status: "active" },
      defaults: {
        name: legacyType,
        description: `Migrated from legacy Product.type=${legacyType}`,
        status: "active",
      },
    });

    await Product.update(
      { productTypeId: productType.id },
      { where: { id: matchingProducts.map(({ id }) => id) } }
    );
  }

  const remainingUnassigned = await Product.count({
    where: { productTypeId: null },
  });
  if (remainingUnassigned > 0) {
    throw new Error(
      `Cannot require product_type_id: ${remainingUnassigned} product(s) have no legacy type to migrate`
    );
  }

  const orphanedProductTypes = await sequelize.query<{ id: number }>(
    `SELECT products.id
     FROM products
     LEFT JOIN product_types ON product_types.id = products.product_type_id
     WHERE product_types.id IS NULL`,
    { type: QueryTypes.SELECT }
  );
  if (orphanedProductTypes.length > 0) {
    throw new Error(
      `Cannot add product type foreign key: ${orphanedProductTypes.length} product(s) reference a missing product type`
    );
  }

  const currentProductColumns = await queryInterface.describeTable("products");
  if (currentProductColumns.product_type_id.allowNull) {
    await queryInterface.changeColumn("products", "product_type_id", {
      type: "BIGINT",
      allowNull: false,
    });
  }

  const constraints = await sequelize.query<ConstraintRow>(
    `SELECT CONSTRAINT_NAME AS constraint_name
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'products'
       AND COLUMN_NAME = 'product_type_id'
       AND REFERENCED_TABLE_NAME = 'product_types'`,
    { type: QueryTypes.SELECT }
  );

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
}
