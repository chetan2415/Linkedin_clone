import express from "express";
import { createResume, getResume, deleteResume, downloadResume} from "../controllers/ResumeController.js";

const router = express.Router();

router.post("/create", createResume);
router.get("/getResume/:id", getResume);
router.delete("/deleteResume/:id", deleteResume);
router.get("/downloadResume/:id", downloadResume);

export default router;
