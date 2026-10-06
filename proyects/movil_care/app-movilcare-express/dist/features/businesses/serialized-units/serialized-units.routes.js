"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serialized_units_controller_1 = require("./serialized-units.controller");
const router = (0, express_1.Router)();
router.get("/serialized-units", serialized_units_controller_1.serializedUnitsController.list);
router.get("/serialized-units/:id", serialized_units_controller_1.serializedUnitsController.getById);
router.post("/serialized-units", serialized_units_controller_1.serializedUnitsController.create);
router.put("/serialized-units/:id", serialized_units_controller_1.serializedUnitsController.replace);
router.patch("/serialized-units/:id", serialized_units_controller_1.serializedUnitsController.update);
router.patch("/serialized-units/:id/sell", serialized_units_controller_1.serializedUnitsController.sell);
router.patch("/serialized-units/:id/in-service", serialized_units_controller_1.serializedUnitsController.service);
router.delete("/serialized-units/:id", serialized_units_controller_1.serializedUnitsController.remove);
exports.default = router;
//# sourceMappingURL=serialized-units.routes.js.map