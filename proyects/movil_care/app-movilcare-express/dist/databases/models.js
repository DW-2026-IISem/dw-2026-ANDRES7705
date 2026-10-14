"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../features/businesses/products/products.model");
require("../features/businesses/product-types/product-types.model");
require("../features/businesses/products/products.associations");
require("../features/businesses/customers/customers.model");
require("../features/businesses/employees/employees.model");
require("../features/businesses/spare-parts/spare-parts.model");
require("../features/businesses/serialized-units/serialized-units.model");
require("../features/businesses/sales/sales.model");
require("../features/businesses/sale-details/sale-details.model");
require("../features/businesses/warranties/warranties.model");
require("../features/businesses/service-orders/service-orders.model");
require("../features/businesses/service-orders/diagnostics.model");
require("../features/businesses/service-orders/service-authorizations.model");
require("../features/businesses/spare-part-consumptions/spare-part-consumptions.model");
require("../features/businesses/payments/payments.model");
/*
 * Modelos de autenticación y autorización RBAC.
 * Se conservan todos los modelos de negocio existentes.
 */
require("../features/auth/users/user.model");
require("../features/auth/roles/role.model");
require("../features/auth/resources/resource.model");
require("../features/auth/role-users/role-user.model");
require("../features/auth/resource-roles/resource-role.model");
require("../features/auth/refresh-tokens/refresh-token.model");
// Relaciones entre usuarios, roles, recursos y tokens.
require("../features/auth/rbac.associations");
//# sourceMappingURL=models.js.map