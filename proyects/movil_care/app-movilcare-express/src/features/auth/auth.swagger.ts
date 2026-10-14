
import { FeatureSwaggerModule } from "../../swagger";

const authSwagger: FeatureSwaggerModule = {
  tags: [
    {
      name: "Autenticación",
      description: "Inicio de sesión y gestión de sesiones mediante JWT.",
    },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Autenticación"],
        summary: "Iniciar sesión",
        description:
          "Valida las credenciales y devuelve un token de acceso y un token de renovación.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["identifier", "password"],
                properties: {
                  identifier: {
                    type: "string",
                    example: "usuario",
                    description: "Nombre de usuario o correo electrónico.",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "********",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Inicio de sesión exitoso.",
          },
          "400": {
            description: "Solicitud inválida.",
          },
          "401": {
            description: "Credenciales inválidas o cuenta inactiva.",
          },
          "500": {
            description: "Error interno del servidor.",
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Autenticación"],
        summary: "Renovar tokens",
        description:
          "Intercambia un token de renovación válido por una nueva sesión de tokens.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: {
                    type: "string",
                    description: "Token de renovación vigente.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tokens renovados correctamente.",
          },
          "400": {
            description: "Solicitud inválida.",
          },
          "401": {
            description: "Token de renovación inválido, vencido o revocado.",
          },
          "500": {
            description: "Error interno del servidor.",
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Autenticación"],
        summary: "Cerrar sesión",
        description: "Revoca la sesión asociada al token de renovación.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: {
                    type: "string",
                    description: "Token de renovación de la sesión.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Sesión cerrada correctamente.",
          },
          "400": {
            description: "Solicitud inválida.",
          },
          "401": {
            description: "Token de renovación inválido.",
          },
          "500": {
            description: "Error interno del servidor.",
          },
        },
      },
    },
  },
};

export default authSwagger;
