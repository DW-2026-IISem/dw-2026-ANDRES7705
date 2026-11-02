import dotenv from "dotenv";
import { sequelize } from "../../../databases/db";
import "../../../databases/models";
import { seedRoles } from "../roles/roles.seeder";
import { Resource } from "../resources/resource.model";
import { ResourceRole } from "../resource-roles/resource-role.model";

dotenv.config();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ResourceAction =
  | "list"
  | "read"
  | "create"
  | "replace"
  | "update"
  | "delete"
  | "deactivate"
  | "permanent-delete"
  | "confirm"
  | "cancel"
  | "sell"
  | "in-service"
  | "change-state";

type ResourceDefinition = {
  method: HttpMethod;
  path: string;
  description: string;
  module: string;
  action: ResourceAction;
};

function crudResources(module: string, label: string): ResourceDefinition[] {
  return [
    { method: "GET", path: `/${module}`, description: `Listar ${label}`, module, action: "list" },
    { method: "GET", path: `/${module}/:id`, description: `Consultar ${label}`, module, action: "read" },
    { method: "POST", path: `/${module}`, description: `Crear ${label}`, module, action: "create" },
    { method: "PUT", path: `/${module}/:id`, description: `Reemplazar ${label}`, module, action: "replace" },
    { method: "PATCH", path: `/${module}/:id`, description: `Actualizar ${label}`, module, action: "update" },
    { method: "DELETE", path: `/${module}/:id`, description: `Eliminar ${label}`, module, action: "delete" },
  ];
}

const crudModules = [
  ["customers", "clientes"],
  ["employees", "empleados"],
  ["products", "productos"],
  ["product-types", "tipos de producto"],
  ["sales", "ventas"],
  ["sale-details", "detalles de venta"],
  ["serialized-units", "unidades serializadas"],
  ["spare-parts", "repuestos"],
  ["warranties", "garantías"],
  ["spare-part-consumptions", "consumos de repuestos"],
  ["payments", "pagos"],
] as const;

const resources: ResourceDefinition[] = [
  ...crudModules.flatMap(([module, label]) => crudResources(module, label)),
  { method: "GET", path: "/users", description: "Listar usuarios", module: "users", action: "list" },
  { method: "GET", path: "/users/:id", description: "Consultar usuarios", module: "users", action: "read" },
  { method: "POST", path: "/users", description: "Crear usuarios", module: "users", action: "create" },
  { method: "PATCH", path: "/users/:id", description: "Actualizar usuarios", module: "users", action: "update" },
  { method: "DELETE", path: "/users/:id", description: "Desactivar usuarios", module: "users", action: "delete" },
  {
    method: "DELETE",
    path: "/products/:id/permanent",
    description: "Eliminar producto permanentemente",
    module: "products",
    action: "permanent-delete",
  },
  {
    method: "PATCH",
    path: "/products/:id/deactivate",
    description: "Desactivar producto",
    module: "products",
    action: "deactivate",
  },
  {
    method: "PATCH",
    path: "/product-types/:id/deactivate",
    description: "Desactivar tipo de producto",
    module: "product-types",
    action: "deactivate",
  },
  {
    method: "PATCH",
    path: "/sale-details/:id/deactivate",
    description: "Desactivar detalle de venta",
    module: "sale-details",
    action: "deactivate",
  },
  {
    method: "POST",
    path: "/sales/:id/confirm",
    description: "Confirmar venta",
    module: "sales",
    action: "confirm",
  },
  {
    method: "PATCH",
    path: "/sales/:id/confirm",
    description: "Confirmar venta",
    module: "sales",
    action: "confirm",
  },
  {
    method: "PATCH",
    path: "/sales/:id/cancel",
    description: "Cancelar venta",
    module: "sales",
    action: "cancel",
  },
  {
    method: "PATCH",
    path: "/serialized-units/:id/sell",
    description: "Registrar venta de unidad serializada",
    module: "serialized-units",
    action: "sell",
  },
  {
    method: "PATCH",
    path: "/serialized-units/:id/in-service",
    description: "Enviar unidad a servicio",
    module: "serialized-units",
    action: "in-service",
  },
  {
    method: "GET",
    path: "/service-orders",
    description: "Listar órdenes de servicio",
    module: "service-orders",
    action: "list",
  },
  {
    method: "GET",
    path: "/service-orders/:id",
    description: "Consultar órdenes de servicio",
    module: "service-orders",
    action: "read",
  },
  {
    method: "POST",
    path: "/service-orders",
    description: "Crear órdenes de servicio",
    module: "service-orders",
    action: "create",
  },
  {
    method: "PATCH",
    path: "/service-orders/:id",
    description: "Actualizar órdenes de servicio",
    module: "service-orders",
    action: "update",
  },
  {
    method: "PATCH",
    path: "/service-orders/:id/state",
    description: "Cambiar estado de orden de servicio",
    module: "service-orders",
    action: "change-state",
  },
  ...(["diagnostics", "service-authorizations"] as const).flatMap((module) => [
    {
      method: "GET" as const,
      path: `/${module}`,
      description: `Listar ${module}`,
      module,
      action: "list" as const,
    },
    {
      method: "GET" as const,
      path: `/${module}/:id`,
      description: `Consultar ${module}`,
      module,
      action: "read" as const,
    },
    {
      method: "POST" as const,
      path: `/${module}`,
      description: `Crear ${module}`,
      module,
      action: "create" as const,
    },
  ]),
];

async function main(): Promise<void> {
  await sequelize.authenticate();

  await sequelize.transaction(async (transaction) => {
    let createdResources = 0;
    let createdPermissions = 0;

    const activeResources = new Map<string, Resource>();

    for (const definition of resources) {
      const [resource, created] = await Resource.findOrCreate({
        where: {
          method: definition.method,
          path: definition.path,
        },
        defaults: {
          method: definition.method,
          path: definition.path,
          description: definition.description,
          status: "active",
        },
        transaction,
      });

      if (created) {
        createdResources++;
      } else if (resource.status !== "active" || resource.description !== definition.description) {
        await resource.update(
          { status: "active", description: definition.description },
          { transaction }
        );
      }

      activeResources.set(`${definition.method}:${definition.path}`, resource);
    }

    const { seededRoles, createdCount: createdRoles, roleNames } = await seedRoles(transaction);

    for (const { role, definition: roleDefinition } of seededRoles) {
      for (const resourceDefinition of resources) {
        const granted =
          roleDefinition.grantAll === true ||
          (roleDefinition.modules?.[resourceDefinition.module]?.includes(resourceDefinition.action) ??
            false);

        if (!granted) {
          continue;
        }

        const resource = activeResources.get(
          `${resourceDefinition.method}:${resourceDefinition.path}`
        );
        if (!resource) {
          throw new Error(
            `No se encontró el recurso ${resourceDefinition.method} ${resourceDefinition.path}.`
          );
        }

        const [relation, relationCreated] = await ResourceRole.findOrCreate({
          where: {
            role_id: role.id,
            resource_id: resource.id,
          },
          defaults: {
            role_id: role.id,
            resource_id: resource.id,
            status: "active",
          },
          transaction,
        });

        if (relationCreated) {
          createdPermissions++;
        } else if (relation.status !== "active") {
          await relation.update({ status: "active" }, { transaction });
        }
      }
    }

    console.log("Inicialización RBAC completada.");
    console.log(`Roles configurados: ${roleNames.join(", ")}`);
    console.log(`Roles creados en esta ejecución: ${createdRoles}`);
    console.log(`Recursos creados en esta ejecución: ${createdResources}`);
    console.log(`Permisos vinculados en esta ejecución: ${createdPermissions}`);
  });
}

main()
  .catch((error: unknown) => {
    console.error(
      "Error al inicializar RBAC:",
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
