import { faker } from "@faker-js/faker";
import { Customer } from "./customers.model";

type CustomerDocumentType = Customer["documentType"];

const CUSTOMER_DOCUMENT_TYPES: CustomerDocumentType[] = [
  "CC",
  "CE",
  "NIT",
  "PASSPORT",
  "TI",
];

export async function seedCustomers(count: number): Promise<number> {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError("Customer seed count must be a non-negative integer");
  }

  if (count === 0) {
    console.log("⏭️  customers: count=0, se omite");
    return 0;
  }

  const existing = await Customer.count();
  if (existing > 0) {
    console.log(`⏭️  customers: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      documentType: faker.helpers.arrayElement(CUSTOMER_DOCUMENT_TYPES),
      documentNumber: `${faker.string.numeric(14)}${String(index).padStart(6, "0")}`,
      firstName,
      lastName,
      companyName: null,
      phone: faker.string.numeric(10),
      email: `customer.${index}.${faker.string.alphanumeric(8).toLowerCase()}@example.com`,
      address: faker.location.streetAddress(),
      isActive: true,
    };
  });

  await Customer.bulkCreate(rows);
  console.log(`✅ customers: insertados ${count} registro(s) falsos`);
  return count;
}
