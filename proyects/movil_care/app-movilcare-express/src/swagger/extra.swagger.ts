import { FeatureSwaggerModule } from "./index";

const crudPaths = (
  name: string,
  tag: string,
  methods: string[] = ["get", "post", "put", "patch", "delete"],
) => {
  const collection: Record<string, unknown> = {};
  const item: Record<string, unknown> = {};

  for (const method of methods) {
    const isRead = method === "get";
    const isCreate = method === "post";

    const operation = {
      tags: [tag],
      summary: isRead
        ? `Consultar ${name}`
        : isCreate
          ? `Crear ${name}`
          : `${method.toUpperCase()} ${name}`,
      description: "Endpoint sin autenticación.",
      security: [],
      ...(method === "post" || method === "put" || method === "patch"
        ? {
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
              },
            },
          }
        : {}),
      
responses: {
  [isCreate ? "201" : "200"]: {
    description: "Operación completada correctamente",
  },
  "400": { description: "Datos inválidos o campos inválidos" },
  "404": { description: "Registro relacionado o recurso no encontrado" },
  "409": {
    description: "Conflicto con el estado actual, una restricción única o una regla del negocio",
  },
  "500": { description: "Error interno del servidor" },
},

    };

    if (method === "get" || method === "post") {
      collection[method] = operation;
    }

    if (method === "get" || method === "put" ||
        method === "patch" || method === "delete") {
      item[method] = operation;
    }
  }

  return {
    [`/api/${name}`]: collection,
    [`/api/${name}/{id}`]: {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
        },
      ],
      ...item,
    },
  };
};

const paths = {
  ...crudPaths("payments", "Pagos"),
  ...crudPaths("warranties", "Garantías"),
  ...crudPaths("employees", "Empleados"),
  ...crudPaths("spare-parts", "Repuestos"),

  ...crudPaths("serialized-units", "Unidades serializadas", [
    "get",
    "post",
    "put",
    "patch",
    "delete",
  ]),

  ...crudPaths("service-orders", "Órdenes de servicio", [
    "get",
    "post",
    "patch",
  ]),

  ...crudPaths("diagnostics", "Diagnósticos", ["get", "post"]),

  ...crudPaths("service-authorizations", "Autorizaciones de servicio", [
    "get",
    "post",
  ]),

  "/api/service-orders/{id}/state": {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer", minimum: 1 },
      },
    ],
    patch: {
      tags: ["Órdenes de servicio"],
      summary: "Cambiar estado de una orden de servicio",
      description: "Actualiza el estado de una orden de servicio.",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
      },
      responses: {
        "200": { description: "Estado actualizado correctamente" },
        "400": { description: "Estado o datos inválidos" },
        "404": { description: "Orden de servicio no encontrada" },
        "409": {description: "Transición de estado no permitida o requisitos de reparación incumplidos",
},
        "500": { description: "Error interno del servidor" },
      },
    },
  },

  "/api/serialized-units/{id}/sell": {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer", minimum: 1 },
      },
    ],
    patch: {
      tags: ["Unidades serializadas"],
      summary: "Marcar unidad serializada como vendida",
      description: "Acción para registrar la venta de una unidad serializada.",
      security: [],
      responses: {
        "200": { description: "Unidad actualizada correctamente" },
        "400": { description: "Operación inválida" },
        "404": { description: "Unidad no encontrada" },
        "409": { description: "Transición de estado no permitida" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },

  "/api/serialized-units/{id}/in-service": {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer", minimum: 1 },
      },
    ],
    patch: {
      tags: ["Unidades serializadas"],
      summary: "Marcar unidad serializada en servicio",
      description: "Acción para cambiar el estado de una unidad serializada.",
      security: [],
      responses: {
        "200": { description: "Unidad actualizada correctamente" },
        "400": { description: "Operación inválida" },
        "404": { description: "Unidad no encontrada" },
        "409": { description: "Transición de estado no permitida" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
};

export const extraSwagger: FeatureSwaggerModule = {
  tags: [
    { name: "Pagos", description: "Gestión de pagos" },
    { name: "Garantías", description: "Gestión de garantías" },
    { name: "Empleados", description: "Gestión de empleados" },
    { name: "Repuestos", description: "Inventario de repuestos" },
    {
      name: "Unidades serializadas",
      description: "Gestión y estado de equipos serializados",
    },
    {
      name: "Órdenes de servicio",
      description: "Gestión de órdenes de reparación",
    },
    { name: "Diagnósticos", description: "Diagnósticos técnicos" },
    {
      name: "Autorizaciones de servicio",
      description: "Autorizaciones de reparaciones",
    },
  ],
  paths,
};
