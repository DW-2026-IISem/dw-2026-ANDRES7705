import { faker } from "@faker-js/faker";
import { sequelize } from "../../../databases/db";
import { Role } from "../roles/role.model";
import { RoleUser } from "../role-users/role-user.model";
import { User } from "./user.model";

export async function seedUsers(count: number): Promise<number> {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError("User seed count must be a non-negative integer");
  }
  if (count === 0) {
    console.log("⏭️  users: count=0, se omite");
    return 0;
  }

  const existing = await User.count();
  if (existing > 0) {
    console.log(`⏭️  users: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const roles = await Role.findAll({
    where: { status: "active" },
    order: [["id", "ASC"]],
  });
  if (roles.length === 0) {
    throw new Error("No se pueden sembrar usuarios sin al menos un rol activo.");
  }

  await sequelize.transaction(async (transaction) => {
    for (let index = 0; index < count; index++) {
      const user = await User.create(
        {
          username: `demo.${index}.${faker.string.alphanumeric(8).toLowerCase()}`,
          email: `demo.${index}.${faker.string.alphanumeric(8).toLowerCase()}@example.com`,
          password: faker.internet.password({ length: 24 }),
          status: "active",
        },
        { transaction }
      );

      await RoleUser.create(
        {
          user_id: user.id,
          role_id: roles[index % roles.length].id,
          status: "active",
        },
        { transaction }
      );
    }
  });

  console.log(`✅ users: insertados ${count} registro(s) falsos`);
  return count;
}
