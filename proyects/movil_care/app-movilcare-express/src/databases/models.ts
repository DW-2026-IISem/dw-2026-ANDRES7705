import "../features/businesses/products/products.model";
import "../features/businesses/product-types/product-types.model";
import "../features/businesses/products/products.associations";
import "../features/businesses/customers/customers.model";
import "../features/businesses/employees/employees.model";
import "../features/businesses/spare-parts/spare-parts.model";
import "../features/businesses/serialized-units/serialized-units.model";
import "../features/businesses/sales/sales.model";
import "../features/businesses/sale-details/sale-details.model";
import "../features/businesses/warranties/warranties.model";
import "../features/businesses/service-orders/service-orders.model";
import "../features/businesses/service-orders/diagnostics.model";
import "../features/businesses/service-orders/service-authorizations.model";
import "../features/businesses/spare-part-consumptions/spare-part-consumptions.model";
import "../features/businesses/payments/payments.model";
/*
 * Modelos de autenticación y autorización RBAC.
 * Se conservan todos los modelos de negocio existentes.
 */
import "../features/auth/users/user.model";
import "../features/auth/roles/role.model";
import "../features/auth/resources/resource.model";
import "../features/auth/role-users/role-user.model";
import "../features/auth/resource-roles/resource-role.model";
import "../features/auth/refresh-tokens/refresh-token.model";

// Relaciones entre usuarios, roles, recursos y tokens.
import "../features/auth/rbac.associations";
