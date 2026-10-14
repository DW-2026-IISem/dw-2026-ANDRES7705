"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("node:readline/promises"));
const node_process_1 = require("node:process");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../databases/db");
require("../databases/models");
const user_model_1 = require("../features/auth/users/user.model");
const role_model_1 = require("../features/auth/roles/role.model");
const role_user_model_1 = require("../features/auth/role-users/role-user.model");
dotenv_1.default.config();
async function main() {
    const rl = promises_1.default.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout });
    try {
        console.log("=== Inicialización del administrador de MóvilCare ===");
        const username = (await rl.question("Nombre de usuario: "))
            .trim()
            .toLowerCase();
        const email = (await rl.question("Correo electrónico: "))
            .trim()
            .toLowerCase();
        const password = await new Promise((resolve, reject) => {
            const stdin = process.stdin;
            let value = "";
            if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
                reject(new Error("Ejecuta este script directamente en una terminal interactiva."));
                return;
            }
            const wasRaw = stdin.isRaw ?? false;
            const cleanup = () => {
                stdin.removeListener("data", onData);
                stdin.setRawMode(wasRaw);
                stdin.pause();
                process.stdout.write("\n");
            };
            const onData = (data) => {
                for (const char of data.toString("utf8")) {
                    if (char === "\u0003") {
                        cleanup();
                        reject(new Error("Operación cancelada."));
                        return;
                    }
                    if (char === "\r" || char === "\n") {
                        cleanup();
                        resolve(value);
                        return;
                    }
                    if (char === "\u007f" || char === "\b") {
                        value = value.slice(0, -1);
                    }
                    else if (char >= " ") {
                        value += char;
                    }
                }
            };
            process.stdout.write("Contraseña: ");
            stdin.setRawMode(true);
            stdin.resume();
            stdin.on("data", onData);
        });
        if (!/^[a-z0-9._-]{3,80}$/.test(username)) {
            throw new Error("El usuario debe tener entre 3 y 80 caracteres válidos.");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("El correo electrónico no tiene un formato válido.");
        }
        if (password.length < 8) {
            throw new Error("La contraseña debe tener al menos 8 caracteres.");
        }
        await db_1.sequelize.authenticate();
        const existingUser = await user_model_1.User.findOne({
            where: {
                username,
            },
        });
        if (existingUser) {
            throw new Error("Ese nombre de usuario ya existe. No se modificó la cuenta.");
        }
        const existingEmail = await user_model_1.User.findOne({
            where: {
                email,
            },
        });
        if (existingEmail) {
            throw new Error("Ese correo ya existe. No se modificó la cuenta.");
        }
        const adminRole = await role_model_1.Role.findOne({
            where: {
                name: "ADMIN",
            },
        });
        if (!adminRole || adminRole.status !== "active") {
            throw new Error("El rol ADMIN no existe o está inactivo. Configura el rol y sus permisos RBAC antes de crear la cuenta.");
        }
        await db_1.sequelize.transaction(async (transaction) => {
            const user = await user_model_1.User.create({
                username,
                email,
                password,
                status: "active",
            }, { transaction });
            await role_user_model_1.RoleUser.create({
                user_id: user.id,
                role_id: adminRole.id,
                status: "active",
            }, { transaction });
            console.log(`Administrador creado: ${user.username}`);
            console.log("La cuenta quedó activa y vinculada al rol ADMIN.");
            console.log("Nota: los permisos sobre las rutas deben configurarse por separado.");
        });
    }
    finally {
        rl.close();
        await db_1.sequelize.close();
    }
}
main().catch((error) => {
    console.error("No se pudo crear el administrador:", error instanceof Error ? error.message : "Error desconocido.");
    process.exitCode = 1;
});
//# sourceMappingURL=create-admin.js.map