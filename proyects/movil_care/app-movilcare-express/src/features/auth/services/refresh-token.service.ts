
import { randomUUID } from "node:crypto";
import { Transaction } from "sequelize";
import { sequelize } from "../../../databases/db";
import {
  generateOpaqueToken,
  sha256Hex,
} from "../../../shared/auth/password";
import { User } from "../users/user.model";
import { RefreshToken } from "../refresh-tokens/refresh-token.model";

const INVALID_REFRESH_TOKEN = "El refresh token es inválido o ha expirado.";

function getRefreshTokenLifetimeMs(): number {
  const value = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const match = /^(\d+)(m|h|d)$/.exec(value);

  if (!match) {
    throw new Error(
      "JWT_REFRESH_EXPIRES_IN debe tener formato como 15m, 12h o 7d."
    );
  }

  const amount = Number(match[1]);
  const unit = match[2];

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("La duración del refresh token no es válida.");
  }

  const multiplier =
    unit === "m"
      ? 60_000
      : unit === "h"
        ? 3_600_000
        : 86_400_000;

  const lifetime = amount * multiplier;

  if (!Number.isSafeInteger(lifetime)) {
    throw new Error("La duración del refresh token es demasiado grande.");
  }

  return lifetime;
}

function createExpiryDate(): Date {
  return new Date(Date.now() + getRefreshTokenLifetimeMs());
}

export interface RefreshSessionResult {
  refreshToken: string;
  expiresAt: Date;
}

export async function createRefreshSession(
  userId: number,
  deviceInfo?: string | null,
  transaction?: Transaction
): Promise<RefreshSessionResult> {
  const refreshToken = generateOpaqueToken();

  const record = await RefreshToken.create(
    {
      user_id: userId,
      token_hash: sha256Hex(refreshToken),
      family_id: randomUUID(),
      device_info: deviceInfo?.slice(0, 500) ?? null,
      expires_at: createExpiryDate(),
      status: "active",
    },
    { transaction }
  );

  return {
    refreshToken,
    expiresAt: record.expires_at,
  };
}

export interface RotateRefreshSessionResult extends RefreshSessionResult {
  user: {
    id: number;
    username: string;
    email: string;
  };
}


export async function rotateRefreshSession(
  rawRefreshToken: string,
  deviceInfo?: string | null
): Promise<RotateRefreshSessionResult> {
  if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
    throw new Error(INVALID_REFRESH_TOKEN);
  }

  const transaction = await sequelize.transaction();

  try {
    const tokenHash = sha256Hex(rawRefreshToken);

    const currentToken = await RefreshToken.findOne({
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
      await RefreshToken.update(
        { status: "inactive" },
        {
          where: {
            family_id: currentToken.family_id,
            status: "active",
          },
          transaction,
        }
      );

      await transaction.commit();
      throw new Error(INVALID_REFRESH_TOKEN);
    }

    if (currentToken.expires_at.getTime() <= Date.now()) {
      await currentToken.update(
        { status: "inactive" },
        { transaction }
      );

      await transaction.commit();
      throw new Error(INVALID_REFRESH_TOKEN);
    }

    const user = await User.findByPk(currentToken.user_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user || user.status !== "active") {
      await RefreshToken.update(
        { status: "inactive" },
        {
          where: {
            family_id: currentToken.family_id,
            status: "active",
          },
          transaction,
        }
      );

      await transaction.commit();
      throw new Error(INVALID_REFRESH_TOKEN);
    }

    await currentToken.update(
      { status: "inactive" },
      { transaction }
    );

    const nextRefreshToken = generateOpaqueToken();
    const expiresAt = createExpiryDate();

    await RefreshToken.create(
      {
        user_id: user.id,
        token_hash: sha256Hex(nextRefreshToken),
        family_id: currentToken.family_id,
        device_info:
          deviceInfo?.slice(0, 500) ?? currentToken.device_info,
        expires_at: expiresAt,
        status: "active",
      },
      { transaction }
    );

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
     } catch (error: unknown) {
    try {
      await transaction.rollback();
    } catch {
      // La transacción puede haberse confirmado o revertido previamente.
    }

    throw error;
  }
 }


export async function revokeRefreshSession(
  rawRefreshToken: string
): Promise<void> {
  if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
    return;
  }

  await RefreshToken.update(
    { status: "inactive" },
    {
      where: {
        token_hash: sha256Hex(rawRefreshToken),
        status: "active",
      },
    }
  );
}
