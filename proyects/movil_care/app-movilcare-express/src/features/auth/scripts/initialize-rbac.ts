import dotenv from "dotenv";
import { Op } from "sequelize";
import { sequelize } from "../../../databases/db";
import "../../../databases/models";
import { Role } from "../roles/role.model";
import { Resource } from "../resources/resource.model";
import { ResourceRole } from "../resource-roles/resource-role.model";

dotenv.config();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const resources: Array<{
  method: HttpMethod;
  path: string;
  description: string;
}> = [
  ...[
    "customers",
    "employees",
    "products",
    "product-types",
    "sales",
    "sale-details",
    "serialized-units",
    "spare-parts",
    "warranties",
    "spare-part-consumptions",
    "payments",
  ].flatMap((name) => [
    { method: "GET" as const, path: `/${name}`, description: `Listar ${name}` },
    { method: "GET" as const, path: `/${name}/:id`, description: `Consultar ${name}` },
    { method: "POST" as const, path: `/${name}`, description: `Crear ${name}` },
    { method: "PUT" as const, path: `/${name}/:id`, description: `Reemplazar ${name}` },
    { method: "PATCH" as const, path: `/${name}/:id`, description: `Actualizar ${name}` },
    { method: "DELETE" as const, path: `/${name}/:id`, description: `Eliminar ${name}` },
  ]),

  { method: "DELETE", path: "/products/:id/permanent", description: "Eliminar producto permanentemente" },
  { method: "PATCH", path: "/products/:id/deactivate", description: "Desactivar producto" },
  { method: "PATCH", path: "/product-types/:id/deactivate", description: "Desactivar tipo de producto" },
  { method: "PATCH", path: "/sale-details/:id/deactivate", description: "Desactivar detalle de venta" },
  { method: "POST", path: "/sales/:id/confirm", description: "Confirmar venta" },
  { method: "PATCH", path: "/sales/:id/confirm", description: "Confirmar venta" },
  { method: "PATCH", path: "/sales/:id/cancel", description: "Cancelar venta" },
  { method: "PATCH", path: "/serialized-units/:id/sell", description: "Registrar venta de unidad serializada" },
  { method: "PATCH", path: "/serialized-units/:id/in-service", description: "Enviar unidad a servicio" },

  ...[
    "service-orders",
  ].flatMap((name) => [
    { method: "GET" as const, path: `/${name}`, description: `Listar ${name}` },
    { method: "GET" as const, path: `/${name}/:id`, description: `Consultar ${name}` },
    { method: "POST" as const, path: `/${name}`, description: `Crear ${name}` },
    { method: "PATCH" as const, path: `/${name}/:id`, description: `Actualizar ${name}` },
  ]),

  { method: "PATCH", path: "/service-orders/:id/state", description: "Cambiar estado de orden de servicio" },

  ...[
    "diagnostics",
    "service-authorizations",
  ].flatMap((name) => [
    { method: "GET" as const, path: `/${name}`, description: `Listar ${name}` },
    { method: "GET" as const, path: `/${name}/:id`, description: `Consultar ${name}` },
    { method: "POST" as const, path: `/${name}`, description: `Crear ${name}` },
  ]),
];
async function main(): Promise<void> {
  await sequelize.authenticate();

  await sequelize.transaction(async (transaction) => {
    const [role] = await Role.findOrCreate({
      where: { name: "ADMIN" },
      defaults: {
        name: "ADMIN",
        description: "Administrador del sistema MóvilCare Express",
        status: "active",
      },
      transaction,
    });

    if (role.status !== "active") {
      await role.update({ status: "active" }, { transaction });
    }

    let createdResources = 0;
    let linkedResources = 0;

    for (const item of resources) {
      const [resource, created] = await Resource.findOrCreate({
        where: {
          method: item.method,
          path: item.path,
        },
        defaults: {
          ...item,
          status: "active",
        },
        transaction,
      });

      if (created) {
        createdResources++;
      } else if (resource.status !== "active") {
        await resource.update({ status: "active" }, { transaction });
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

      if (!relationCreated && relation.status !== "active") {
        await relation.update({ status: "active" }, { transaction });
      }

      if (relationCreated) {
        linkedResources++;
      }
    }

    const totalResources = await Resource.count({
      where: {
        status: "active",
        method: { [Op.in]: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
      },
      transaction,
    });

    console.log("Inicialización RBAC completada.");
    console.log(`Rol: ${role.name} (activo)`);
    console.log(`Recursos creados en esta ejecución: ${createdResources}`);
    console.log(`Permisos vinculados en esta ejecución: ${linkedResources}`);
    console.log(`Total de recursos activos en la tabla: ${totalResources}`);
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
