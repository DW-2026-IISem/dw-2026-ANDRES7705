"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = loginController;
exports.refreshController = refreshController;
exports.logoutController = logoutController;
const auth_service_1 = require("../services/auth.service");
const refresh_token_service_1 = require("../services/refresh-token.service");
const jwt_service_1 = require("../services/jwt.service");
const INVALID_CREDENTIALS = "Credenciales inválidas o cuenta inactiva.";
const INVALID_REFRESH_TOKEN = "El refresh token es inválido o ha expirado.";
async function loginController(req, res) {
    const { identifier, password } = req.body ?? {};
    if (typeof identifier !== "string" ||
        typeof password !== "string" ||
        !identifier.trim() ||
        !password) {
        res.status(400).json({
            message: "Debes enviar identifier y password como texto.",
        });
        return;
    }
    try {
        const result = await (0, auth_service_1.login)({ identifier, password });
        res.status(200).json({
            message: "Inicio de sesión exitoso.",
            ...result,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === INVALID_CREDENTIALS) {
            res.status(401).json({
                message: INVALID_CREDENTIALS,
            });
            return;
        }
        console.error("Error en el inicio de sesión:", error);
        res.status(500).json({
            message: "No fue posible completar el inicio de sesión.",
        });
    }
}
async function refreshController(req, res) {
    const { refreshToken } = req.body ?? {};
    if (typeof refreshToken !== "string" ||
        !refreshToken.trim()) {
        res.status(400).json({
            message: "Debes enviar refreshToken como texto.",
        });
        return;
    }
    try {
        const session = await (0, refresh_token_service_1.rotateRefreshSession)(refreshToken, typeof req.headers["user-agent"] === "string"
            ? req.headers["user-agent"]
            : null);
        const accessToken = (0, jwt_service_1.signAccessToken)({
            sub: String(session.user.id),
            username: session.user.username,
        });
        res.status(200).json({
            message: "Sesión renovada correctamente.",
            accessToken,
            tokenType: "Bearer",
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
            refreshToken: session.refreshToken,
            refreshTokenExpiresAt: session.expiresAt,
            user: session.user,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === INVALID_REFRESH_TOKEN) {
            res.status(401).json({
                message: INVALID_REFRESH_TOKEN,
            });
            return;
        }
        console.error("Error al renovar la sesión:", error);
        res.status(500).json({
            message: "No fue posible renovar la sesión.",
        });
    }
}
async function logoutController(req, res) {
    const { refreshToken } = req.body ?? {};
    if (typeof refreshToken !== "string" ||
        !refreshToken.trim()) {
        res.status(400).json({
            message: "Debes enviar refreshToken como texto.",
        });
        return;
    }
    try {
        await (0, refresh_token_service_1.revokeRefreshSession)(refreshToken);
        res.status(200).json({
            message: "Sesión cerrada correctamente.",
        });
    }
    catch (error) {
        console.error("Error al cerrar sesión:", error);
        res.status(500).json({
            message: "No fue posible cerrar la sesión.",
        });
    }
}
//# sourceMappingURL=auth.controller.js.map