"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleDetailsSwagger = void 0;
exports.saleDetailsSwagger = {
    tags: [{ name: "SaleDetails", description: "Sale lines (existing equivalent of ProductSale)" }],
    paths: {
        "/api/sale-details": {
            get: {
                tags: ["SaleDetails"],
                summary: "List active sale details",
                security: [],
                responses: { "200": { description: "Sale details" } },
            },
            post: {
                tags: ["SaleDetails"],
                summary: "Add a detail to a draft sale",
                description: "Uses the current product price and tax. Inventory is deducted only when the parent sale is confirmed.",
                security: [],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/SaleDetailCreate" } } },
                },
                responses: {
                    "201": { description: "Sale detail created" },
                    "400": { description: "Invalid detail or insufficient stock" },
                    "409": { description: "Sale is not a draft" },
                },
            },
        },
        "/api/sale-details/{id}": {
            get: {
                tags: ["SaleDetails"],
                summary: "Get sale detail by ID",
                security: [],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
                responses: { "200": { description: "Sale detail found" }, "404": { description: "Not found" } },
            },
            put: {
                tags: ["SaleDetails"],
                summary: "Replace a draft sale detail",
                security: [],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/SaleDetailUpdate" } } },
                },
                responses: { "200": { description: "Updated" }, "409": { description: "Sale is not a draft" } },
            },
            patch: {
                tags: ["SaleDetails"],
                summary: "Partially update a draft sale detail",
                security: [],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/SaleDetailPatch" } } },
                },
                responses: { "200": { description: "Updated" }, "409": { description: "Sale is not a draft" } },
            },
            delete: {
                tags: ["SaleDetails"],
                summary: "Permanently delete a detail from a draft sale",
                security: [],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
                responses: { "200": { description: "Deleted" }, "409": { description: "Sale is not a draft" } },
            },
        },
        "/api/sale-details/{id}/deactivate": {
            patch: {
                tags: ["SaleDetails"],
                summary: "Logically deactivate a detail on a draft sale",
                security: [],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
                responses: { "200": { description: "Deactivated" }, "409": { description: "Sale is not a draft" } },
            },
        },
    },
    components: {
        schemas: {
            SaleDetailCreate: {
                type: "object",
                required: ["saleId", "productId", "quantity"],
                properties: {
                    saleId: { type: "integer", minimum: 1 },
                    productId: { type: "integer", minimum: 1 },
                    quantity: { type: "integer", minimum: 1 },
                    serializedUnitId: { type: "integer", nullable: true, minimum: 1 },
                    discount: { type: "number", minimum: 0, default: 0 },
                    notes: { type: "string", nullable: true },
                },
            },
            SaleDetailUpdate: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                    productId: { type: "integer", minimum: 1 },
                    quantity: { type: "integer", minimum: 1 },
                    serializedUnitId: { type: "integer", nullable: true, minimum: 1 },
                    discount: { type: "number", minimum: 0 },
                    notes: { type: "string", nullable: true },
                },
            },
            SaleDetailPatch: {
                type: "object",
                minProperties: 1,
                properties: {
                    productId: { type: "integer", minimum: 1 },
                    quantity: { type: "integer", minimum: 1 },
                    serializedUnitId: { type: "integer", nullable: true, minimum: 1 },
                    discount: { type: "number", minimum: 0 },
                    notes: { type: "string", nullable: true },
                },
            },
        },
    },
};
//# sourceMappingURL=sale-details.swagger.js.map