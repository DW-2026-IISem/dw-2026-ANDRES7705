export type SeedCounts = {
  customers: number;
  product_types: number;
  products: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  customers: 10,
  product_types: 25,
  products: 15,
};

function parseCount(value: string, source: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${source} must be a non-negative integer`);
  }

  const count = Number(value);
  if (!Number.isSafeInteger(count)) {
    throw new Error(`${source} must be a safe integer`);
  }

  return count;
}

export function resolveSeedCounts(argv: string[] = process.argv.slice(2)): SeedCounts {
  const counts: SeedCounts = { ...DEFAULT_SEED_COUNTS };
  const envCustomers = process.env.SEED_CUSTOMERS;
  const envProductTypes = process.env.SEED_PRODUCT_TYPES;
  const envProducts = process.env.SEED_PRODUCTS;

  if (envCustomers !== undefined && envCustomers !== "") {
    counts.customers = parseCount(envCustomers, "SEED_CUSTOMERS");
  }
  if (envProductTypes !== undefined && envProductTypes !== "") {
    counts.product_types = parseCount(envProductTypes, "SEED_PRODUCT_TYPES");
  }
  if (envProducts !== undefined && envProducts !== "") {
    counts.products = parseCount(envProducts, "SEED_PRODUCTS");
  }

  for (const arg of argv) {
    if (arg.startsWith("--customers=")) {
      counts.customers = parseCount(arg.slice("--customers=".length), "--customers");
    } else if (arg.startsWith("--product_types=")) {
      counts.product_types = parseCount(
        arg.slice("--product_types=".length),
        "--product_types"
      );
    } else if (arg.startsWith("--product-types=")) {
      counts.product_types = parseCount(
        arg.slice("--product-types=".length),
        "--product-types"
      );
    } else if (arg.startsWith("--products=")) {
      counts.products = parseCount(arg.slice("--products=".length), "--products");
    }
  }

  return counts;
}
