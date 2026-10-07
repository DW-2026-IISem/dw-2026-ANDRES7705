import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { customerSwagger } from "../features/businesses/customers/customers.swagger";

export type FeatureSwaggerModule = {
  tags: unknown[];
  paths: Record<string, unknown>;
  components?: { schemas?: Record<string, unknown> };
};

const featureSwaggerModules: FeatureSwaggerModule[] = [customerSwagger];

export function buildOpenApiDocument() {
  const tags: unknown[] = [];
  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};

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
      description:
        "API de MovilCare (Express + Sequelize). Las rutas documentadas actualmente no requieren autenticación.",
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

export function setupSwagger(app: Application): void {
  const document = buildOpenApiDocument();
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(document));
  app.get("/api/docs.json", (_req, res) => {
    res.json(document);
  });
  console.log("📘 Swagger UI: /api/docs | OpenAPI JSON: /api/docs.json");
}
