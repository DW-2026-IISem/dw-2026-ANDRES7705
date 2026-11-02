
import { Router } from "express";
import { grantResourceToRole } from "./resource-roles.controller";

const router = Router();

router.post("/concesiones-rol", grantResourceToRole);

export default router;
