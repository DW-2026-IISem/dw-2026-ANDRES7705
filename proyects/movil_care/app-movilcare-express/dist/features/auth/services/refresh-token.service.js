"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshSession = createRefreshSession;
exports.rotateRefreshSession = rotateRefreshSession;
exports.revokeRefreshSession = revokeRefreshSession;
const node_crypto_1 = require("node:crypto");
const db_1 = require("../../../databases/db");
const password_1 = require("../../../shared/auth/password");
const user_model_1 = require("../users/user.model");
const refresh_token_model_1 = require("../refresh-tokens/refresh-token.model");
const INVALID_REFRESH_TOKEN = "El refresh token es inválido o ha expirado.";
function getRefreshTokenLifetimeMs() {
    const value = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    const match = /^(\d+)(m|h|d)$/.exec(value);
    if (!match) {
        throw new Error("JWT_REFRESH_EXPIRES_IN debe tener formato como 15m, 12h o 7d.");
    }
    const amount = Number(match[1]);
    const unit = match[2];
    if (!Number.isSafeInteger(amount) || amount <= 0) {
        throw new Error("La duración del refresh token no es válida.");
    }
    const multiplier = unit === "m"
        ? 60000
        : unit === "h"
            ? 3600000
            : 86400000;
    const lifetime = amount * multiplier;
    if (!Number.isSafeInteger(lifetime)) {
        throw new Error("La duración del refresh token es demasiado grande.");
    }
    return lifetime;
}
function createExpiryDate() {
    return new Date(Date.now() + getRefreshTokenLifetimeMs());
}
async function createRefreshSession(userId, deviceInfo, transaction) {
    const refreshToken = (0, password_1.generateOpaqueToken)();
    const record = await refresh_token_model_1.RefreshToken.create({
        user_id: userId,
        token_hash: (0, password_1.sha256Hex)(refreshToken),
        family_id: (0, node_crypto_1.randomUUID)(),
        device_info: deviceInfo?.slice(0, 500) ?? null,
        expires_at: createExpiryDate(),
        status: "active",
    }, { transaction });
    return {
        refreshToken,
        expiresAt: record.expires_at,
    };
}
async function rotateRefreshSession(rawRefreshToken, deviceInfo) {
    if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
        throw new Error(INVALID_REFRESH_TOKEN);
    }
    const transaction = await db_1.sequelize.transaction();
    try {
        const tokenHash = (0, password_1.sha256Hex)(rawRefreshToken);
        const currentToken = await refresh_token_model_1.RefreshToken.findOne({
            where: { token_hash: tokenHash },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!currentToken) {
            throw new Error(INVALID_REFRESH_TOKEN);
        }
        // Un token ya rotado indica posible reutilización.
        // Revocar toda la familia si el token anterior vuelve a presentarse.
        if (currentToken.status !== "active") {
            await refresh_token_model_1.RefreshToken.update({ status: "inactive" }, {
                where: {
                    family_id: currentToken.family_id,
                    status: "active",
                },
                transaction,
            });
            await transaction.commit();
            throw new Error(INVALID_REFRESH_TOKEN);
        }
        if (currentToken.expires_at.getTime() <= Date.now()) {
            await currentToken.update({ status: "inactive" }, { transaction });
            await transaction.commit();
            throw new Error(INVALID_REFRESH_TOKEN);
        }
        const user = await user_model_1.User.findByPk(currentToken.user_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!user || user.status !== "active") {
            await refresh_token_model_1.RefreshToken.update({ status: "inactive" }, {
                where: {
                    family_id: currentToken.family_id,
                    status: "active",
                },
                transaction,
            });
            await transaction.commit();
            throw new Error(INVALID_REFRESH_TOKEN);
        }
        await currentToken.update({ status: "inactive" }, { transaction });
        const nextRefreshToken = (0, password_1.generateOpaqueToken)();
        const expiresAt = createExpiryDate();
        await refresh_token_model_1.RefreshToken.create({
            user_id: user.id,
            token_hash: (0, password_1.sha256Hex)(nextRefreshToken),
            family_id: currentToken.family_id,
            device_info: deviceInfo?.slice(0, 500) ?? currentToken.device_info,
            expires_at: expiresAt,
            status: "active",
        }, { transaction });
        await transaction.commit();
        return {
            refreshToken: nextRefreshToken,
            expiresAt,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };
    }
    catch (error) {
        try {
            await transaction.rollback();
        }
        catch {
            // La transacción puede haberse confirmado o revertido previamente.
        }
        throw error;
    }
}
async function revokeRefreshSession(rawRefreshToken) {
    if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
        return;
    }
    await refresh_token_model_1.RefreshToken.update({ status: "inactive" }, {
        where: {
            token_hash: (0, password_1.sha256Hex)(rawRefreshToken),
            status: "active",
        },
    });
}
//# sourceMappingURL=refresh-token.service.js.map