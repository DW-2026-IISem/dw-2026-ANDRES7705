import { Router } from "express";
import customersRouter from "../features/businesses/customers/customers.routes";
import employeesRouter from "../features/businesses/employees/employees.routes";
import productsRouter from "../features/businesses/products/products.routes";
import serializedUnitsRouter from "../features/businesses/serialized-units/serialized-units.routes";
import sparePartsRouter from "../features/businesses/spare-parts/spare-parts.routes";

const router = Router();

router.use(customersRouter);
router.use(employeesRouter);
router.use(productsRouter);
router.use(serializedUnitsRouter);
router.use(sparePartsRouter);

export default router;
