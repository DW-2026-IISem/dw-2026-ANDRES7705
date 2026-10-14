"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_service_1 = require("../services/jwt.service");
function authenticate(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Se requiere un token de acceso.",
        });
        return;
    }
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
        res.status(401).json({
            message: "El token de acceso está vacío.",
        });
        return;
    }
    try {
        const payload = (0, jwt_service_1.verifyAccessToken)(token);
        const userId = Number(payload.sub);
        if (!Number.isSafeInteger(userId) || userId <= 0) {
            res.status(401).json({
                message: "El token no contiene un identificador válido.",
            });
            return;
        }
        req.auth = {
            userId,
            username: payload.username,
        };
        next();
    }
    catch {
        res.status(401).json({
            message: "El token es inválido o ha expirado.",
        });
    }
}
//# sourceMappingURL=authenticate.middleware.js.map