import ResumeModel from "../models/ResumeModel.js";
import convertResumeToPDF from "../utile/convertResumeToPDF.js";
import User from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
import path from "path";

// CREATE
export const createResume = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing or invalid" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.TOKEN_KEY);
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const user = await User.findById(decoded.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  try {
    const resume = new ResumeModel({ ...req.body, userId: user._id });
    await resume.save();
    const populatedResume = await ResumeModel.findById(resume._id).populate('userId', 'name username email profilePicture');
    res.status(201).json({ message: "Resume created successfully", resume: populatedResume });
  } catch (error) {
    res.status(500).json({ message: "Error creating resume", error: error.message });
  }
};

// GET
export const getResume = async (req, res) => {
  const resumeId = req.params.id;
  //console.log(resumeId);
  try {
    const resume = await ResumeModel.findById(resumeId).populate('userId', 'name username email profilePicture');
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json({ resume });
  } catch (error) {
    res.status(500).json({ message: "Error fetching resume", error: error.message });
  }
};

// DELETE
export const deleteResume = async (req, res) => {
  const resumeId = req.params.id;
  try {
    const deletedResume = await ResumeModel.findByIdAndDelete(resumeId);
    if (!deletedResume) return res.status(404).json({ message: "Resume not found" });
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting resume", error: error.message });
  }
};

// DOWNLOAD
export const downloadResume = async (req, res) => {
  const resumeId = req.params.id;
  const type = req.query.type || "fresher"; // Default to fresher

  try {
    //console.log("Fetching resume ID:", resumeId, "with type:", type);
    const resume = await ResumeModel.findById(resumeId).populate(
      "userId",
      "name username email profilePicture"
    );
    if (!resume) {
      //console.error("Resume not found:", resumeId);
      return res.status(404).json({ message: "Resume not found" });
    }

    const outputPath = await convertResumeToPDF(resume, type);
    const filePath = path.resolve(outputPath);
    //console.log("PDF generated at:", filePath);

    res.download(filePath, (err) => {
      if (err) {
        res.status(500).json({
          message: "Error downloading resume",
          error: err.message,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error generating or downloading resume",
      error: error.message,
    });
  }
};
