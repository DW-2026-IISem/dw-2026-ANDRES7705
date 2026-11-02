"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../../../databases/db");
require("../../../databases/models");
const role_model_1 = require("../roles/role.model");
const resource_model_1 = require("../resources/resource.model");
const resource_role_model_1 = require("../resource-roles/resource-role.model");
dotenv_1.default.config();
function crudResources(module, label) {
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
];
const resources = [
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
    ...["diagnostics", "service-authorizations"].flatMap((module) => [
        {
            method: "GET",
            path: `/${module}`,
            description: `Listar ${module}`,
            module,
            action: "list",
        },
        {
            method: "GET",
            path: `/${module}/:id`,
            description: `Consultar ${module}`,
            module,
            action: "read",
        },
        {
            method: "POST",
            path: `/${module}`,
            description: `Crear ${module}`,
            module,
            action: "create",
        },
    ]),
];
const roles = [
    {
        name: "ADMIN",
        description: "Administrador con acceso completo al sistema MóvilCare Express",
        grantAll: true,
    },
    {
        name: "RECEPCIONISTA",
        description: "Gestiona clientes y registra órdenes de servicio",
        modules: {
            customers: ["list", "read", "create", "replace", "update"],
            "service-orders": ["list", "read", "create"],
            warranties: ["list", "read"],
            "serialized-units": ["list", "read"],
        },
    },
    {
        name: "TECNICO",
        description: "Gestiona diagnósticos, autorizaciones y órdenes de servicio",
        modules: {
            "service-orders": ["list", "read", "update", "change-state"],
            diagnostics: ["list", "read", "create"],
            "service-authorizations": ["list", "read", "create"],
            "spare-part-consumptions": ["list", "read", "create"],
            "serialized-units": ["list", "read", "in-service"],
            warranties: ["list", "read"],
        },
    },
    {
        name: "INVENTARIO",
        description: "Administra productos, repuestos y unidades serializadas",
        modules: {
            products: ["list", "read", "create", "replace", "update", "delete", "deactivate"],
            "product-types": ["list", "read", "create", "replace", "update", "deactivate"],
            "spare-parts": ["list", "read", "create", "replace", "update", "delete"],
            "serialized-units": ["list", "read", "create", "replace", "update", "delete"],
            "spare-part-consumptions": ["list", "read"],
            "sale-details": ["list", "read"],
        },
    },
    {
        name: "VENTAS",
        description: "Gestiona ventas, pagos y atención comercial a clientes",
        modules: {
            customers: ["list", "read", "create", "update"],
            products: ["list", "read"],
            "product-types": ["list", "read"],
            sales: ["list", "read", "create", "update", "confirm", "cancel"],
            "sale-details": ["list", "read", "create", "update"],
            payments: ["list", "read", "create", "update"],
            "serialized-units": ["list", "read", "sell"],
            warranties: ["list", "read"],
        },
    },
];
async function main() {
    await db_1.sequelize.authenticate();
    await db_1.sequelize.transaction(async (transaction) => {
        let createdResources = 0;
        let createdRoles = 0;
        let createdPermissions = 0;
        const activeResources = new Map();
        for (const definition of resources) {
            const [resource, created] = await resource_model_1.Resource.findOrCreate({
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
            }
            else if (resource.status !== "active" || resource.description !== definition.description) {
                await resource.update({ status: "active", description: definition.description }, { transaction });
            }
            activeResources.set(`${definition.method}:${definition.path}`, resource);
        }
        for (const roleDefinition of roles) {
            const [role, created] = await role_model_1.Role.findOrCreate({
                where: { name: roleDefinition.name },
                defaults: {
                    name: roleDefinition.name,
                    description: roleDefinition.description,
                    status: "active",
                },
                transaction,
            });
            if (created) {
                createdRoles++;
            }
            else if (role.status !== "active" || role.description !== roleDefinition.description) {
                await role.update({ status: "active", description: roleDefinition.description }, { transaction });
            }
            for (const resourceDefinition of resources) {
                const granted = roleDefinition.grantAll === true ||
                    (roleDefinition.modules?.[resourceDefinition.module]?.includes(resourceDefinition.action) ??
                        false);
                if (!granted) {
                    continue;
                }
                const resource = activeResources.get(`${resourceDefinition.method}:${resourceDefinition.path}`);
                if (!resource) {
                    throw new Error(`No se encontró el recurso ${resourceDefinition.method} ${resourceDefinition.path}.`);
                }
                const [relation, relationCreated] = await resource_role_model_1.ResourceRole.findOrCreate({
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
                }
                else if (relation.status !== "active") {
                    await relation.update({ status: "active" }, { transaction });
                }
            }
        }
        console.log("Inicialización RBAC completada.");
        console.log(`Roles configurados: ${roles.map(({ name }) => name).join(", ")}`);
        console.log(`Roles creados en esta ejecución: ${createdRoles}`);
        console.log(`Recursos creados en esta ejecución: ${createdResources}`);
        console.log(`Permisos vinculados en esta ejecución: ${createdPermissions}`);
    });
}
main()
    .catch((error) => {
    console.error("Error al inicializar RBAC:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
})
    .finally(async () => {
    await db_1.sequelize.close();
});
//# sourceMappingURL=initialize-rbac.js.map