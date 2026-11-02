export const usersSwagger = {
  tags: [
    {
      name: "Users",
      description: "Gestión de usuarios y asignación de roles (solo ADMIN)",
    },
  ],
  paths: {
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Listar usuarios",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
        ],
        responses: {
          "200": { description: "Usuarios paginados, sin contraseñas" },
          "401": { description: "No autenticado" },
          "403": { description: "Se requiere permiso ADMIN" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Crear usuario y asignarle roles",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password", "roleIds"],
                properties: {
                  username: { type: "string", minLength: 3, maxLength: 80 },
                  email: { type: "string", format: "email", maxLength: 150 },
                  password: { type: "string", minLength: 8, writeOnly: true },
                  avatar: { type: "string", nullable: true, maxLength: 500 },
                  status: { type: "string", enum: ["active", "inactive"], default: "active" },
                  roleIds: { type: "array", minItems: 1, uniqueItems: true, items: { type: "integer", minimum: 1 } },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Usuario creado; nunca incluye la contraseña" },
          "400": { description: "Datos inválidos o rol inactivo/inexistente" },
          "409": { description: "Nombre de usuario o correo duplicado" },
        },
      },
    },
    "/api/users/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } },
      ],
      get: {
        tags: ["Users"],
        summary: "Consultar usuario por ID",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Usuario y roles asignados, sin contraseña" },
          "404": { description: "Usuario no encontrado" },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Actualizar usuario y opcionalmente sus roles",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", minLength: 3, maxLength: 80 },
                  email: { type: "string", format: "email", maxLength: 150 },
                  password: { type: "string", minLength: 8, writeOnly: true },
                  avatar: { type: "string", nullable: true, maxLength: 500 },
                  status: { type: "string", enum: ["active", "inactive"] },
                  roleIds: { type: "array", minItems: 1, uniqueItems: true, items: { type: "integer", minimum: 1 } },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Usuario actualizado, sin contraseña" },
          "400": { description: "Datos inválidos o rol inactivo/inexistente" },
          "404": { description: "Usuario no encontrado" },
          "409": { description: "Nombre de usuario o correo duplicado" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Desactivar usuario",
        description: "Desactiva la cuenta sin eliminarla permanentemente.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Usuario desactivado" },
          "404": { description: "Usuario no encontrado" },
        },
      },
    },
  },
};
