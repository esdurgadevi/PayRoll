// routes/inwardLotWeightmentRoutes.js
import express from "express";
import {
  saveWeightment,
  getWeightments,
  deleteWeightments,
} from "../controllers/inwardLotWeightmentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.post("/:lotNo/weightments", saveWeightment);
router.get("/:lotNo/weightments", getWeightments);
router.put("/:lotNo/weightments", saveWeightment);
router.delete("/:lotNo/weightments", deleteWeightments);

export default router;
