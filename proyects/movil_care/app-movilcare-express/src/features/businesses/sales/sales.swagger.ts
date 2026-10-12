export const salesSwagger = {
  tags: [{ name: "Sales", description: "Sales lifecycle and inventory confirmation" }],
  paths: {
    "/api/sales": {
      get: {
        tags: ["Sales"],
        summary: "List sales with active details",
        security: [],
        responses: { "200": { description: "Paginated sales" } },
      },
      post: {
        tags: ["Sales"],
        summary: "Create a draft sale and its details atomically",
        description:
          "Creates a DRAFT sale. Inventory is checked on creation and decremented only when the sale is confirmed.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/SaleCreate" } },
          },
        },
        responses: {
          "201": { description: "Draft sale and details created" },
          "400": { description: "Invalid customer, product, quantity, or serial unit" },
          "404": { description: "Customer or product not found" },
        },
      },
    },
    "/api/sales/{id}": {
      get: {
        tags: ["Sales"],
        summary: "Get sale by ID",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: { "200": { description: "Sale found" }, "404": { description: "Sale not found" } },
      },
      put: {
        tags: ["Sales"],
        summary: "Replace editable draft sale fields",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SaleUpdate" } } },
        },
        responses: { "200": { description: "Sale updated" }, "409": { description: "Sale is not a draft" } },
      },
      patch: {
        tags: ["Sales"],
        summary: "Partially update editable draft sale fields",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SalePatch" } } },
        },
        responses: { "200": { description: "Sale updated" }, "409": { description: "Sale is not a draft" } },
      },
      delete: {
        tags: ["Sales"],
        summary: "Permanently delete a draft or cancelled sale",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: { "200": { description: "Sale deleted" }, "409": { description: "Cancel the sale first" } },
      },
    },
    "/api/sales/{id}/confirm": {
      post: {
        tags: ["Sales"],
        summary: "Confirm sale and deduct inventory atomically",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          "200": { description: "Sale confirmed" },
          "400": { description: "Invalid sale or insufficient inventory" },
          "404": { description: "Sale not found" },
        },
      },
    },
    "/api/sales/{id}/cancel": {
      patch: {
        tags: ["Sales"],
        summary: "Cancel draft/confirmed sale and restore confirmed inventory",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: { "200": { description: "Sale cancelled" }, "409": { description: "Sale cannot be cancelled" } },
      },
    },
  },
  components: {
    schemas: {
      SaleCreate: {
        type: "object",
        required: ["customerId", "items"],
        properties: {
          number: { type: "string", maxLength: 20 },
          customerId: { type: "integer", minimum: 1 },
          sellerId: { type: "integer", nullable: true, minimum: 1 },
          soldAt: { type: "string", format: "date-time" },
          items: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: { type: "integer", minimum: 1 },
                quantity: { type: "integer", minimum: 1 },
                serializedUnitId: { type: "integer", nullable: true, minimum: 1 },
                discount: { type: "number", minimum: 0, default: 0 },
                notes: { type: "string", nullable: true },
              },
            },
          },
        },
      },
      SaleUpdate: {
        type: "object",
        required: ["customerId", "soldAt"],
        properties: {
          customerId: { type: "integer", minimum: 1 },
          sellerId: { type: "integer", nullable: true, minimum: 1 },
          soldAt: { type: "string", format: "date-time" },
        },
      },
      SalePatch: {
        type: "object",
        minProperties: 1,
        properties: {
          customerId: { type: "integer", minimum: 1 },
          sellerId: { type: "integer", nullable: true, minimum: 1 },
          soldAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};
