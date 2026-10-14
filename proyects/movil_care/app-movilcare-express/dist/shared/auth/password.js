"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.sha256Hex = sha256Hex;
exports.generateOpaqueToken = generateOpaqueToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const node_crypto_1 = require("node:crypto");
const BCRYPT_ROUNDS = 12;
async function hashPassword(password) {
    if (typeof password !== "string" || password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }
    return bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
}
async function verifyPassword(password, passwordHash) {
    if (typeof password !== "string" || typeof passwordHash !== "string") {
        return false;
    }
    return bcryptjs_1.default.compare(password, passwordHash);
}
function sha256Hex(value) {
    return (0, node_crypto_1.createHash)("sha256").update(value, "utf8").digest("hex");
}
function generateOpaqueToken() {
    return (0, node_crypto_1.randomBytes)(48).toString("base64url");
}
//# sourceMappingURL=password.js.map