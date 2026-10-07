/**
 * OpenAPI documentation for the customers feature.
 * The external Swagger registry mounts these paths under the /api prefix.
 * These routes currently have no authentication middleware.
 */
export const customerSwagger = {
  tags: [
    {
      name: "Customers",
      description: "Customer management — SIN AUTH (no authentication middleware)",
    },
  ],
  paths: {
    "/api/customers": {
      get: {
        tags: ["Customers"],
        summary: "List customers",
        description: "Returns a paginated list of customers. SIN AUTH.",
        security: [],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "offset",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 0, default: 0 },
          },
        ],
        responses: {
          "200": {
            description: "Paginated customer list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["items", "total", "limit", "offset"],
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Customer" },
                    },
                    total: { type: "integer", minimum: 0 },
                    limit: { type: "integer", minimum: 1, maximum: 100 },
                    offset: { type: "integer", minimum: 0 },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid pagination parameters" },
        },
      },
      post: {
        tags: ["Customers"],
        summary: "Create a customer",
        description: "SIN AUTH.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Customer created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          "400": { description: "Invalid body or field validation failed" },
          "409": { description: "Document or email already exists" },
        },
      },
    },
    "/api/customers/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Positive customer identifier",
          schema: { type: "integer", format: "int64", minimum: 1 },
        },
      ],
      get: {
        tags: ["Customers"],
        summary: "Get a customer by ID",
        description: "SIN AUTH.",
        security: [],
        responses: {
          "200": {
            description: "Customer found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          "400": { description: "Invalid customer ID" },
          "404": { description: "Customer not found" },
        },
      },
      put: {
        tags: ["Customers"],
        summary: "Replace a customer",
        description:
          "Replaces editable fields; documentType, documentNumber and firstName are required. SIN AUTH.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerReplace" },
            },
          },
        },
        responses: {
          "200": {
            description: "Customer replaced",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          "400": { description: "Invalid ID or replacement body" },
          "404": { description: "Customer not found" },
          "409": { description: "Document or email already exists" },
        },
      },
      patch: {
        tags: ["Customers"],
        summary: "Partially update a customer",
        description:
          "At least one editable field is required. SIN AUTH.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerPatch" },
            },
          },
        },
        responses: {
          "200": {
            description: "Customer updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          "400": { description: "Invalid ID or patch body" },
          "404": { description: "Customer not found" },
          "409": { description: "Document or email already exists" },
        },
      },
      delete: {
        tags: ["Customers"],
        summary: "Deactivate a customer (soft delete)",
        description:
          "Sets isActive to false; this endpoint does not physically delete the customer. SIN AUTH.",
        security: [],
        responses: {
          "200": {
            description: "Customer deactivated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          "400": { description: "Invalid customer ID" },
          "404": { description: "Customer not found" },
        },
      },
    },
  },
  components: {
    schemas: {
      Customer: {
        type: "object",
        required: [
          "id",
          "documentType",
          "documentNumber",
          "firstName",
          "isActive",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "integer", format: "int64", example: 1 },
          documentType: {
            type: "string",
            enum: ["CC", "CE", "NIT", "PASSPORT", "TI"],
            example: "CC",
          },
          documentNumber: { type: "string", maxLength: 30, example: "1234567890" },
          firstName: { type: "string", maxLength: 100, example: "Ana" },
          lastName: {
            type: "string",
            nullable: true,
            maxLength: 100,
            example: "Pérez",
          },
          companyName: {
            type: "string",
            nullable: true,
            maxLength: 150,
            example: null,
          },
          phone: {
            type: "string",
            nullable: true,
            maxLength: 20,
            example: "+573001234567",
          },
          email: {
            type: "string",
            format: "email",
            nullable: true,
            maxLength: 120,
            example: "ana@example.com",
          },
          address: {
            type: "string",
            nullable: true,
            maxLength: 200,
            example: "Calle 10 #20-30",
          },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CustomerCreate: {
        type: "object",
        required: ["documentType", "documentNumber", "firstName"],
        additionalProperties: false,
        properties: {
          documentType: {
            type: "string",
            enum: ["CC", "CE", "NIT", "PASSPORT", "TI"],
          },
          documentNumber: { type: "string", maxLength: 30 },
          firstName: { type: "string", maxLength: 100 },
          lastName: { type: "string", nullable: true, maxLength: 100 },
          companyName: { type: "string", nullable: true, maxLength: 150 },
          phone: { type: "string", nullable: true, maxLength: 20 },
          email: { type: "string", format: "email", nullable: true, maxLength: 120 },
          address: { type: "string", nullable: true, maxLength: 200 },
          isActive: { type: "boolean", default: true },
        },
      },
      CustomerReplace: {
        type: "object",
        required: ["documentType", "documentNumber", "firstName"],
        additionalProperties: false,
        properties: {
          documentType: {
            type: "string",
            enum: ["CC", "CE", "NIT", "PASSPORT", "TI"],
          },
          documentNumber: { type: "string", maxLength: 30 },
          firstName: { type: "string", maxLength: 100 },
          lastName: { type: "string", nullable: true, maxLength: 100 },
          companyName: { type: "string", nullable: true, maxLength: 150 },
          phone: { type: "string", nullable: true, maxLength: 20 },
          email: { type: "string", format: "email", nullable: true, maxLength: 120 },
          address: { type: "string", nullable: true, maxLength: 200 },
          isActive: { type: "boolean", default: true },
        },
      },
      CustomerPatch: {
        type: "object",
        minProperties: 1,
        additionalProperties: false,
        properties: {
          documentType: {
            type: "string",
            enum: ["CC", "CE", "NIT", "PASSPORT", "TI"],
          },
          documentNumber: { type: "string", maxLength: 30 },
          firstName: { type: "string", maxLength: 100 },
          lastName: { type: "string", nullable: true, maxLength: 100 },
          companyName: { type: "string", nullable: true, maxLength: 150 },
          phone: { type: "string", nullable: true, maxLength: 20 },
          email: { type: "string", format: "email", nullable: true, maxLength: 120 },
          address: { type: "string", nullable: true, maxLength: 200 },
          isActive: { type: "boolean" },
        },
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string" },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};
