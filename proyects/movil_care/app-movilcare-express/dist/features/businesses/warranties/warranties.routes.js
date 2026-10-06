"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const warranties_controller_1 = require("./warranties.controller");
const router = (0, express_1.Router)();
router.get("/warranties", warranties_controller_1.warrantiesController.list);
router.get("/warranties/:id", warranties_controller_1.warrantiesController.getById);
router.post("/warranties", warranties_controller_1.warrantiesController.create);
router.put("/warranties/:id", warranties_controller_1.warrantiesController.replace);
router.patch("/warranties/:id", warranties_controller_1.warrantiesController.update);
router.delete("/warranties/:id", warranties_controller_1.warrantiesController.remove);
exports.default = router;
//# sourceMappingURL=warranties.routes.js.map