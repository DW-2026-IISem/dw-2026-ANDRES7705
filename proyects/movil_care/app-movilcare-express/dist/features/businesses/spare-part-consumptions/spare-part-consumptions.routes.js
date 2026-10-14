"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const spare_part_consumptions_controller_1 = require("./spare-part-consumptions.controller");
const router = (0, express_1.Router)();
router.get("/spare-part-consumptions", spare_part_consumptions_controller_1.sparePartConsumptionsController.list);
router.get("/spare-part-consumptions/:id", spare_part_consumptions_controller_1.sparePartConsumptionsController.getById);
router.post("/spare-part-consumptions", spare_part_consumptions_controller_1.sparePartConsumptionsController.create);
router.put("/spare-part-consumptions/:id", spare_part_consumptions_controller_1.sparePartConsumptionsController.replace);
router.patch("/spare-part-consumptions/:id", spare_part_consumptions_controller_1.sparePartConsumptionsController.update);
router.delete("/spare-part-consumptions/:id", spare_part_consumptions_controller_1.sparePartConsumptionsController.remove);
exports.default = router;
//# sourceMappingURL=spare-part-consumptions.routes.js.map