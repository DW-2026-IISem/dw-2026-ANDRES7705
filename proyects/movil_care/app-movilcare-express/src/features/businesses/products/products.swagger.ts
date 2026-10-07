export const productSwagger = {
  tags: [
    {
      name: "Products",
      description: "Product catalog — SIN AUTH",
    },
  ],
  paths: {
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List active products",
        description: "Returns active products with their product type. SIN AUTH.",
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
            description: "Paginated active product list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
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
        tags: ["Products"],
        summary: "Create product",
        description:
          "productTypeId must identify an active product type. SIN AUTH. The legacy type enum remains accepted during migration.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Product created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          "400": { description: "Invalid body or inactive product type" },
          "404": { description: "Product type not found" },
        },
      },
    },
    "/api/products/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", format: "int64", minimum: 1 },
        },
      ],
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        description: "SIN AUTH.",
        security: [],
        responses: {
          "200": {
            description: "Product found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          "400": { description: "Invalid product ID" },
          "404": { description: "Product not found" },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Replace product",
        description: "Requires an active product type. SIN AUTH.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductCreate" },
            },
          },
        },
        responses: {
          "200": { description: "Product replaced" },
          "400": { description: "Invalid request body or inactive product type" },
          "404": { description: "Product or product type not found" },
        },
      },
      patch: {
        tags: ["Products"],
        summary: "Partially update product",
        description:
          "If productTypeId is provided it must identify an active product type. SIN AUTH.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductPatch" },
            },
          },
        },
        responses: {
          "200": { description: "Product updated" },
          "400": { description: "Invalid request body or inactive product type" },
          "404": { description: "Product or product type not found" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Deactivate product",
        description: "Soft delete: sets isActive to false. SIN AUTH.",
        security: [],
        responses: {
          "200": { description: "Product deactivated" },
          "404": { description: "Product not found" },
        },
      },
    },
    "/api/products/{id}/deactivate": {
      patch: {
        tags: ["Products"],
        summary: "Deactivate product",
        description: "Soft delete: sets isActive to false. SIN AUTH.",
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
          "200": { description: "Product deactivated" },
          "400": { description: "Invalid product ID" },
          "404": { description: "Product not found" },
        },
      },
    },
    "/api/products/{id}/permanent": {
      delete: {
        tags: ["Products"],
        summary: "Permanently delete product",
        description:
          "Physically removes the product. Fails with 409 if other records reference it. SIN AUTH.",
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
          "200": { description: "Product permanently deleted" },
          "400": { description: "Invalid product ID" },
          "404": { description: "Product not found" },
          "409": { description: "Product is referenced by other records" },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: "object",
        required: ["id", "sku", "name", "type", "productTypeId", "price", "isActive"],
        properties: {
          id: { type: "integer", format: "int64", example: 1 },
          sku: { type: "string", maxLength: 40, example: "MOV-001" },
          name: { type: "string", maxLength: 150, example: "Laptop Pro" },
          description: { type: "string", nullable: true },
          type: { type: "string", enum: ["EQUIPMENT", "ACCESSORY"] },
          productTypeId: { type: "integer", format: "int64", example: 1 },
          productType: { $ref: "#/components/schemas/ProductType" },
          brand: { type: "string", nullable: true, maxLength: 80 },
          model: { type: "string", nullable: true, maxLength: 80 },
          requiresSerial: { type: "boolean" },
          cost: { type: "number", nullable: true, minimum: 0 },
          price: { type: "number", minimum: 0 },
          taxPercentage: { type: "number", minimum: 0 },
          defaultWarrantyMonths: { type: "integer", minimum: 0 },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductCreate: {
        type: "object",
        required: ["sku", "name", "type", "productTypeId", "price"],
        additionalProperties: false,
        properties: {
          sku: { type: "string", maxLength: 40 },
          name: { type: "string", maxLength: 150 },
          description: { type: "string", nullable: true },
          type: { type: "string", enum: ["EQUIPMENT", "ACCESSORY"] },
          productTypeId: { type: "integer", format: "int64", minimum: 1 },
          brand: { type: "string", nullable: true, maxLength: 80 },
          model: { type: "string", nullable: true, maxLength: 80 },
          requiresSerial: { type: "boolean", default: false },
          cost: { type: "number", nullable: true, minimum: 0 },
          price: { type: "number", minimum: 0 },
          taxPercentage: { type: "number", minimum: 0, default: 0 },
          defaultWarrantyMonths: { type: "integer", minimum: 0, default: 0 },
          isActive: { type: "boolean", default: true },
        },
      },
      ProductPatch: {
        type: "object",
        minProperties: 1,
        additionalProperties: false,
        properties: {
          sku: { type: "string", maxLength: 40 },
          name: { type: "string", maxLength: 150 },
          description: { type: "string", nullable: true },
          type: { type: "string", enum: ["EQUIPMENT", "ACCESSORY"] },
          productTypeId: { type: "integer", format: "int64", minimum: 1 },
          brand: { type: "string", nullable: true, maxLength: 80 },
          model: { type: "string", nullable: true, maxLength: 80 },
          requiresSerial: { type: "boolean" },
          cost: { type: "number", nullable: true, minimum: 0 },
          price: { type: "number", minimum: 0 },
          taxPercentage: { type: "number", minimum: 0 },
          defaultWarrantyMonths: { type: "integer", minimum: 0 },
          isActive: { type: "boolean" },
        },
      },
    },
  },
};
