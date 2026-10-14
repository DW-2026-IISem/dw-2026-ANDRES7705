"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOpenApiDocument = buildOpenApiDocument;
exports.setupSwagger = setupSwagger;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const customers_swagger_1 = require("../features/businesses/customers/customers.swagger");
const products_swagger_1 = require("../features/businesses/products/products.swagger");
const product_types_swagger_1 = require("../features/businesses/product-types/product-types.swagger");
const sales_swagger_1 = require("../features/businesses/sales/sales.swagger");
const sale_details_swagger_1 = require("../features/businesses/sale-details/sale-details.swagger");
const spare_part_consumptions_swagger_1 = require("../features/businesses/spare-part-consumptions/spare-part-consumptions.swagger");
const extra_swagger_1 = require("./extra.swagger");
const auth_swagger_1 = __importDefault(require("../features/auth/auth.swagger"));
const featureSwaggerModules = [
    customers_swagger_1.customerSwagger,
    product_types_swagger_1.productTypeSwagger,
    products_swagger_1.productSwagger,
    sales_swagger_1.salesSwagger,
    sale_details_swagger_1.saleDetailsSwagger,
    spare_part_consumptions_swagger_1.sparePartConsumptionsSwagger,
    extra_swagger_1.extraSwagger,
    auth_swagger_1.default,
];
function buildOpenApiDocument() {
    const tags = [];
    const paths = {};
    const schemas = {};
    for (const module of featureSwaggerModules) {
        tags.push(...module.tags);
        Object.assign(paths, module.paths);
        if (module.components?.schemas) {
            Object.assign(schemas, module.components.schemas);
        }
    }
    return {
        openapi: "3.0.3",
        info: {
            title: "MovilCare API",
            version: "1.0.0",
            description: "API de MovilCare (Express + Sequelize). Las rutas documentadas actualmente no requieren autenticación.",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 4000}`,
                description: "Local",
            },
        ],
        tags,
        paths,
        components: { schemas },
    };
}
function setupSwagger(app) {
    const document = buildOpenApiDocument();
    app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(document));
    app.get("/api/docs.json", (_req, res) => {
        res.json(document);
    });
    console.log("📘 Swagger UI: /api/docs | OpenAPI JSON: /api/docs.json");
}
//# sourceMappingURL=index.js.map