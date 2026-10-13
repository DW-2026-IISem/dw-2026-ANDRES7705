
import { FeatureSwaggerModule } from "../../../swagger";

export const sparePartConsumptionsSwagger: FeatureSwaggerModule = {
  tags: [
    {
      name: "Consumo de repuestos",
      description: "Gestión de repuestos utilizados en órdenes de servicio",
    },
  ],
  paths: {
    "/spare-part-consumptions": {
      get: {
        tags: ["Consumo de repuestos"],
        summary: "Listar consumos de repuestos",
        responses: {
          "200": { description: "Lista de consumos obtenida correctamente" },
        },
      },
      post: {
        tags: ["Consumo de repuestos"],
        summary: "Registrar un consumo de repuesto",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SparePartConsumptionInput" },
              example: {
                serviceOrderId: 1,
                sparePartId: 1,
                quantity: 2,
                unitCost: 15000,
                totalCost: 30000,
                observations: "Repuestos utilizados durante la reparación",
              },
            },
          },
        },
        responses: {
          "201": { description: "Consumo registrado correctamente" },
          "400": { description: "Datos inválidos" },
        },
      },
    },
    "/spare-part-consumptions/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      get: {
        tags: ["Consumo de repuestos"],
        summary: "Consultar un consumo por ID",
        responses: {
          "200": { description: "Consumo encontrado" },
          "404": { description: "Consumo no encontrado" },
        },
      },
      put: {
        tags: ["Consumo de repuestos"],
        summary: "Reemplazar un consumo",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SparePartConsumptionInput" },
            },
          },
        },
        responses: {
          "200": { description: "Consumo reemplazado correctamente" },
          "400": { description: "Datos inválidos" },
        },
      },
      patch: {
        tags: ["Consumo de repuestos"],
        summary: "Actualizar parcialmente un consumo",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SparePartConsumptionUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Consumo actualizado correctamente" },
          "400": { description: "Datos inválidos" },
        },
      },
      delete: {
        tags: ["Consumo de repuestos"],
        summary: "Eliminar un consumo",
        responses: {
          "200": { description: "Consumo eliminado correctamente" },
          "404": { description: "Consumo no encontrado" },
        },
      },
    },
  },
  components: {
    schemas: {
      SparePartConsumptionInput: {
        type: "object",
        required: [
          "serviceOrderId",
          "sparePartId",
          "quantity",
          "unitCost",
          "totalCost",
        ],
        properties: {
          serviceOrderId: { type: "integer", example: 1 },
          sparePartId: { type: "integer", example: 1 },
          quantity: { type: "integer", minimum: 1, example: 2 },
          unitCost: { type: "number", minimum: 0, example: 15000 },
          totalCost: { type: "number", minimum: 0, example: 30000 },
          observations: {
            type: "string",
            nullable: true,
            example: "Repuesto instalado",
          },
        },
      },
      SparePartConsumptionUpdate: {
        type: "object",
        properties: {
          serviceOrderId: { type: "integer", example: 1 },
          sparePartId: { type: "integer", example: 1 },
          quantity: { type: "integer", minimum: 1, example: 2 },
          unitCost: { type: "number", minimum: 0, example: 15000 },
          totalCost: { type: "number", minimum: 0, example: 30000 },
          observations: { type: "string", nullable: true },
        },
      },
    },
  },
};
