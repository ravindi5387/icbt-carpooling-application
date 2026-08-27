import { Router } from "express";
import { createVehicle, getMyVehicles } from "../controllers/vehicle.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createVehicle);
router.get("/", authenticate, getMyVehicles);

export default router;