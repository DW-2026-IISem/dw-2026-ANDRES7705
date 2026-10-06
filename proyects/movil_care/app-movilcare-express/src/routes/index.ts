import { Router } from "express";
import customersRouter from "../features/businesses/customers/customers.routes";
import employeesRouter from "../features/businesses/employees/employees.routes";
import productsRouter from "../features/businesses/products/products.routes";
import saleDetailsRouter from "../features/businesses/sale-details/sale-details.routes";
import salesRouter from "../features/businesses/sales/sales.routes";
import serializedUnitsRouter from "../features/businesses/serialized-units/serialized-units.routes";
import sparePartsRouter from "../features/businesses/spare-parts/spare-parts.routes";
import warrantiesRouter from "../features/businesses/warranties/warranties.routes";

const router = Router();

router.use(customersRouter);
router.use(employeesRouter);
router.use(productsRouter);
router.use(salesRouter);
router.use(saleDetailsRouter);
router.use(serializedUnitsRouter);
router.use(sparePartsRouter);
router.use(warrantiesRouter);

export default router;
