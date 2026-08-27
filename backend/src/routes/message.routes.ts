import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Get chat history for a ride
router.get("/rides/:rideId", authenticate, (req, res) => {
  // TODO: Implement chat history
  res.json({ messages: [] });
});

export default router;