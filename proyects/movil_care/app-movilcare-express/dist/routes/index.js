"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customers_routes_1 = __importDefault(require("../features/businesses/customers/customers.routes"));
const employees_routes_1 = __importDefault(require("../features/businesses/employees/employees.routes"));
const products_routes_1 = __importDefault(require("../features/businesses/products/products.routes"));
const sale_details_routes_1 = __importDefault(require("../features/businesses/sale-details/sale-details.routes"));
const sales_routes_1 = __importDefault(require("../features/businesses/sales/sales.routes"));
const serialized_units_routes_1 = __importDefault(require("../features/businesses/serialized-units/serialized-units.routes"));
const spare_parts_routes_1 = __importDefault(require("../features/businesses/spare-parts/spare-parts.routes"));
const warranties_routes_1 = __importDefault(require("../features/businesses/warranties/warranties.routes"));
const router = (0, express_1.Router)();
router.use(customers_routes_1.default);
router.use(employees_routes_1.default);
router.use(products_routes_1.default);
router.use(sales_routes_1.default);
router.use(sale_details_routes_1.default);
router.use(serialized_units_routes_1.default);
router.use(spare_parts_routes_1.default);
router.use(warranties_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map