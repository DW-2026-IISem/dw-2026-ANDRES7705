"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const sequelize_1 = require("sequelize");
const user_model_1 = require("../users/user.model");
const password_1 = require("../../../shared/auth/password");
const jwt_service_1 = require("./jwt.service");
const INVALID_CREDENTIALS = "Credenciales inválidas o cuenta inactiva.";
async function login(input) {
    const identifier = input.identifier.trim().toLowerCase();
    if (!identifier || !input.password) {
        throw new Error(INVALID_CREDENTIALS);
    }
    const user = await user_model_1.User.findOne({
        where: {
            [sequelize_1.Op.or]: [
                { username: identifier },
                { email: identifier },
            ],
        },
    });
    if (!user || user.status !== "active") {
        throw new Error(INVALID_CREDENTIALS);
    }
    const passwordIsValid = await (0, password_1.verifyPassword)(input.password, user.password);
    if (!passwordIsValid) {
        throw new Error(INVALID_CREDENTIALS);
    }
    const accessToken = (0, jwt_service_1.signAccessToken)({
        sub: String(user.id),
        username: user.username,
    });
    return {
        accessToken,
        tokenType: "Bearer",
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    };
}
//# sourceMappingURL=auth.service.before-refresh.js.map