import type { Transaction } from "sequelize";
import { Role } from "./role.model";

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

type RoleDefinition = {
  name: string;
  description: string;
  grantAll?: boolean;
  modules?: Partial<Record<string, readonly ResourceAction[]>>;
};

const roles: RoleDefinition[] = [
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



export async function seedRoles(transaction: Transaction) {
  let createdCount = 0;
  const seededRoles = [];

  for (const definition of roles) {
    const [role, created] = await Role.findOrCreate({
      where: { name: definition.name },
      defaults: {
        name: definition.name,
        description: definition.description,
        status: "active",
      },
      transaction,
    });

    if (created) {
      createdCount++;
    } else if (role.status !== "active" || role.description !== definition.description) {
      await role.update(
        { status: "active", description: definition.description },
        { transaction }
      );
    }

    seededRoles.push({ role, definition });
  }

  return { seededRoles, createdCount, roleNames: roles.map(({ name }) => name) };
}

