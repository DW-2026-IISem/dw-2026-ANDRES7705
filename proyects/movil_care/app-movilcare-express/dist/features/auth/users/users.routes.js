"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
router.get("/users", user_controller_1.userController.list);
router.get("/users/:id", user_controller_1.userController.getById);
router.post("/users", user_controller_1.userController.create);
router.patch("/users/:id", user_controller_1.userController.update);
router.delete("/users/:id", user_controller_1.userController.deactivate);
exports.default = router;
//# sourceMappingURL=users.routes.js.map