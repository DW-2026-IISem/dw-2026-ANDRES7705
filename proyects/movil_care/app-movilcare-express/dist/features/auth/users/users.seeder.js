"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const faker_1 = require("@faker-js/faker");
const db_1 = require("../../../databases/db");
const role_model_1 = require("../roles/role.model");
const role_user_model_1 = require("../role-users/role-user.model");
const user_model_1 = require("./user.model");
async function seedUsers(count) {
    if (!Number.isSafeInteger(count) || count < 0) {
        throw new RangeError("User seed count must be a non-negative integer");
    }
    if (count === 0) {
        console.log("⏭️  users: count=0, se omite");
        return 0;
    }
    const existing = await user_model_1.User.count();
    if (existing > 0) {
        console.log(`⏭️  users: ya hay ${existing} registro(s), se omite seeder`);
        return 0;
    }
    const roles = await role_model_1.Role.findAll({
        where: { status: "active" },
        order: [["id", "ASC"]],
    });
    if (roles.length === 0) {
        throw new Error("No se pueden sembrar usuarios sin al menos un rol activo.");
    }
    await db_1.sequelize.transaction(async (transaction) => {
        for (let index = 0; index < count; index++) {
            const user = await user_model_1.User.create({
                username: `demo.${index}.${faker_1.faker.string.alphanumeric(8).toLowerCase()}`,
                email: `demo.${index}.${faker_1.faker.string.alphanumeric(8).toLowerCase()}@example.com`,
                password: faker_1.faker.internet.password({ length: 24 }),
                status: "active",
            }, { transaction });
            await role_user_model_1.RoleUser.create({
                user_id: user.id,
                role_id: roles[index % roles.length].id,
                status: "active",
            }, { transaction });
        }
    });
    console.log(`✅ users: insertados ${count} registro(s) falsos`);
    return count;
}
//# sourceMappingURL=users.seeder.js.map