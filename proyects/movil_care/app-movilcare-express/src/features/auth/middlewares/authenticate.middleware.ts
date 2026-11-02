import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/jwt.service";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        username: string;
      };
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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
    const payload = verifyAccessToken(token);
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
  } catch (error: unknown) {
    const reason =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : "Error desconocido al verificar el token.";
    console.warn(`Access token rechazado: ${reason}`);

    res.status(401).json({
      message: "El token es inválido o ha expirado.",
    });
  }
}
