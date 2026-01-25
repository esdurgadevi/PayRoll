import express from "express";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  deleteIssue,
  getNextIssueNo
} from "../controllers/issueController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createIssue);
router.get("/", getAllIssues);
router.get("/:id", getIssueById);
router.get("/next-issue-no", getNextIssueNo);
router.delete("/:id", deleteIssue);
export default router;
