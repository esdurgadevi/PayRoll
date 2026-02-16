import express from "express";
import {
  createQCEntry,
  getQCEntryByLot,
  updateQCEntry,
  deleteQCEntry,
} from "../../../controllers/admin2/transaction-qc/qcEntryController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createQCEntry);
router.get("/lot/:lotId", getQCEntryByLot);        // most useful endpoint for your form
router.put("/:id", updateQCEntry);
router.delete("/:id", deleteQCEntry);

export default router;