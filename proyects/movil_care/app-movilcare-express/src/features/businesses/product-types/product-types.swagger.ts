export const productTypeSwagger = {
  tags: [
    {
      name: "ProductTypes",
      description: "Product type catalog — SIN AUTH",
    },
  ],
  paths: {
    "/api/product-types": {
      get: {
        tags: ["ProductTypes"],
        summary: "List active product types",
        description: "Returns paginated active product types. SIN AUTH.",
        security: [],
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", minimum: 0, default: 0 },
          },
        ],
        responses: {
          "200": {
            description: "Paginated product type list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductType" },
                    },
                    total: { type: "integer" },
                    limit: { type: "integer" },
                    offset: { type: "integer" },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid pagination parameters" },
        },
      },
      post: {
        tags: ["ProductTypes"],
        summary: "Create product type",
        description: "SIN AUTH.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductTypeCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Product type created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductType" },
              },
            },
          },
          "400": { description: "Invalid request body" },
        },
      },
    },
    "/api/product-types/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", format: "int64", minimum: 1 },
        },
      ],
      get: {
        tags: ["ProductTypes"],
        summary: "Get product type by ID",
        description: "SIN AUTH.",
        security: [],
        responses: {
          "200": {
            description: "Product type found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductType" },
              },
            },
          },
          "400": { description: "Invalid product type ID" },
          "404": { description: "Product type not found" },
        },
      },
      put: {
        tags: ["ProductTypes"],
        summary: "Replace product type",
        description: "Requires name. SIN AUTH.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductTypeReplace" },
            },
          },
        },
        responses: {
          "200": { description: "Product type replaced" },
          "400": { description: "Invalid ID or request body" },
          "404": { description: "Product type not found" },
        },
      },
      patch: {
        tags: ["ProductTypes"],
        summary: "Partially update product type",
        description: "SIN AUTH.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductTypePatch" },
            },
          },
        },
        responses: {
          "200": { description: "Product type updated" },
          "400": { description: "Invalid ID or request body" },
          "404": { description: "Product type not found" },
        },
      },
      delete: {
        tags: ["ProductTypes"],
        summary: "Permanently delete product type",
        description: "Physically removes the row. SIN AUTH.",
        security: [],
        responses: {
          "200": { description: "Product type deleted" },
          "400": { description: "Invalid product type ID" },
          "404": { description: "Product type not found" },
        },
      },
    },
    "/api/product-types/{id}/deactivate": {
      patch: {
        tags: ["ProductTypes"],
        summary: "Logically deactivate product type",
        description: "Sets status to inactive. SIN AUTH.",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", format: "int64", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Product type deactivated" },
          "400": { description: "Invalid product type ID" },
          "404": { description: "Product type not found" },
        },
      },
    },
  },
  components: {
    schemas: {
      ProductType: {
        type: "object",
        required: ["id", "name", "status", "createdAt", "updatedAt"],
        properties: {
          id: { type: "integer", format: "int64", example: 1 },
          name: { type: "string", maxLength: 100, example: "Electronics" },
          description: {
            type: "string",
            nullable: true,
            maxLength: 255,
            example: "Devices and accessories",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductTypeCreate: {
        type: "object",
        required: ["name"],
        additionalProperties: false,
        properties: {
          name: { type: "string", maxLength: 100 },
          description: { type: "string", nullable: true, maxLength: 255 },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            default: "active",
          },
        },
      },
      ProductTypeReplace: {
        type: "object",
        required: ["name"],
        additionalProperties: false,
        properties: {
          name: { type: "string", maxLength: 100 },
          description: { type: "string", nullable: true, maxLength: 255 },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      ProductTypePatch: {
        type: "object",
        minProperties: 1,
        additionalProperties: false,
        properties: {
          name: { type: "string", maxLength: 100 },
          description: { type: "string", nullable: true, maxLength: 255 },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
    },
  },
};
