export type SeedCounts = {
  customers: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  customers: 10,
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

  if (envCustomers !== undefined && envCustomers !== "") {
    counts.customers = parseCount(envCustomers, "SEED_CUSTOMERS");
  }

  for (const arg of argv) {
    if (arg.startsWith("--customers=")) {
      counts.customers = parseCount(arg.slice("--customers=".length), "--customers");
    }
  }

  return counts;
}
