import { Router } from "express";
import customersRouter from "../features/businesses/customers/customers.routes";
import employeesRouter from "../features/businesses/employees/employees.routes";
import productsRouter from "../features/businesses/products/products.routes";
import productTypesRouter from "../features/businesses/product-types/product-types.routes";
import saleDetailsRouter from "../features/businesses/sale-details/sale-details.routes";
import salesRouter from "../features/businesses/sales/sales.routes";
import serializedUnitsRouter from "../features/businesses/serialized-units/serialized-units.routes";
import sparePartsRouter from "../features/businesses/spare-parts/spare-parts.routes";
import warrantiesRouter from "../features/businesses/warranties/warranties.routes";
import serviceOrdersRouter from "../features/businesses/service-orders/service-orders.routes";
import sparePartConsumptionsRouter from "../features/businesses/spare-part-consumptions/spare-part-consumptions.routes";
import paymentsRouter from "../features/businesses/payments/payments.routes";
import rolesRouter from "../features/auth/roles/roles.routes";
import authRouter from "../features/auth/routes/auth.routes";
import usersRouter from "../features/auth/users/users.routes";
import { authenticate } from "../features/auth/middlewares/authenticate.middleware";
import { authorizeResource } from "../features/auth/middlewares/authorize-resource.middleware";
import resourceRolesRouter from "../features/auth/resource-roles/resource-roles.routes";
const router = Router();

router.use(authRouter);

// Las rutas de negocio requieren autenticación y autorización RBAC.
router.use(authenticate, authorizeResource);

router.use(rolesRouter);
router.use(usersRouter);
router.use(resourceRolesRouter);
router.use(customersRouter);
router.use(employeesRouter);
router.use(productsRouter);
router.use(productTypesRouter);
router.use(salesRouter);
router.use(saleDetailsRouter);
router.use(serializedUnitsRouter);
router.use(sparePartsRouter);
router.use(warrantiesRouter);
router.use(serviceOrdersRouter);
router.use(sparePartConsumptionsRouter);
router.use(paymentsRouter);

export default router;
