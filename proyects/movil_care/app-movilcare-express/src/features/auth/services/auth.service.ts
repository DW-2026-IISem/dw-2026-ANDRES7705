import { Op } from "sequelize";
import { User } from "../users/user.model";
import { verifyPassword } from "../../../shared/auth/password";
import { signAccessToken } from "./jwt.service";
import { createRefreshSession } from "./refresh-token.service";

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

const INVALID_CREDENTIALS = "Credenciales inválidas o cuenta inactiva.";

export async function login(input: LoginInput): Promise<LoginResult> {
  const identifier = input.identifier.trim().toLowerCase();

  if (!identifier || !input.password) {
    throw new Error(INVALID_CREDENTIALS);
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username: identifier },
        { email: identifier },
      ],
    },
  });

  if (!user || user.status !== "active") {
    throw new Error(INVALID_CREDENTIALS);
  }

  const passwordIsValid = await verifyPassword(
    input.password,
    user.password
  );

  if (!passwordIsValid) {
    throw new Error(INVALID_CREDENTIALS);
  }

  const accessToken = signAccessToken({
    sub: String(user.id),
    username: user.username,
  });

  const session = await createRefreshSession(
    user.id,
    typeof input === "object" ? null : null
  );

  return {
    accessToken,
    tokenType: "Bearer",
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshToken: session.refreshToken,
    refreshTokenExpiresAt: session.expiresAt,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
}
