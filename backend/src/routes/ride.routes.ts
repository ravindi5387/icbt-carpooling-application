import { Router } from "express";
import {
  create,
  list,
  getById,
} from "../controllers/ride.controller";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/", list);

router.get("/:id", getById);

router.post(
  "/",
  authenticate,
  authorize("DRIVER", "ADMIN"),
  create
);

export default router;