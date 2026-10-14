"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getJwtSecret() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("JWT_ACCESS_SECRET debe estar configurado y tener al menos 32 caracteres.");
    }
    return secret;
}
function getAccessTokenExpiresIn() {
    return (process.env.JWT_ACCESS_EXPIRES_IN || "15m");
}
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, getJwtSecret(), {
        expiresIn: getAccessTokenExpiresIn(),
        issuer: "movilcare-express",
        audience: "movilcare-api",
        algorithm: "HS256",
    });
}
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, getJwtSecret(), {
        issuer: "movilcare-express",
        audience: "movilcare-api",
        algorithms: ["HS256"],
    });
    if (typeof decoded === "string" ||
        typeof decoded.sub !== "string" ||
        typeof decoded.username !== "string") {
        throw new Error("El contenido del token no es válido.");
    }
    return {
        sub: decoded.sub,
        username: decoded.username,
    };
}
//# sourceMappingURL=jwt.service.js.map