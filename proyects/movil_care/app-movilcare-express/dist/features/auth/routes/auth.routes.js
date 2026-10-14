"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/auth/login", auth_controller_1.loginController);
router.post("/auth/refresh", auth_controller_1.refreshController);
router.post("/auth/logout", auth_controller_1.logoutController);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map