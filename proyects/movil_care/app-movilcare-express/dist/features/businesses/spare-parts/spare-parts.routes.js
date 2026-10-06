"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const spare_parts_controller_1 = require("./spare-parts.controller");
const router = (0, express_1.Router)();
router.get("/spare-parts", spare_parts_controller_1.sparePartsController.list);
router.get("/spare-parts/:id", spare_parts_controller_1.sparePartsController.getById);
router.post("/spare-parts", spare_parts_controller_1.sparePartsController.create);
router.put("/spare-parts/:id", spare_parts_controller_1.sparePartsController.replace);
router.patch("/spare-parts/:id", spare_parts_controller_1.sparePartsController.update);
router.delete("/spare-parts/:id", spare_parts_controller_1.sparePartsController.remove);
exports.default = router;
//# sourceMappingURL=spare-parts.routes.js.map