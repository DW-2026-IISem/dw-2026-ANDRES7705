import jwt, { SignOptions } from "jsonwebtoken";

export interface AccessTokenPayload {
  sub: string;
  username: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_ACCESS_SECRET debe estar configurado y tener al menos 32 caracteres."
    );
  }

  return secret;
}

function getAccessTokenExpiresIn(): SignOptions["expiresIn"] {
  return (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"];
}

export function signAccessToken(
  payload: AccessTokenPayload
): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getAccessTokenExpiresIn(),
    issuer: "movilcare-express",
    audience: "movilcare-api",
    algorithm: "HS256",
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret(), {
    issuer: "movilcare-express",
    audience: "movilcare-api",
    algorithms: ["HS256"],
  });

  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.username !== "string"
  ) {
    throw new Error("El contenido del token no es válido.");
  }

  return {
    sub: decoded.sub,
    username: decoded.username,
  };
}
