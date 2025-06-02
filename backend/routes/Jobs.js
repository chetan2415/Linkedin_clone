dotenv.config();
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const ADZUNA_KEY = process.env.ADZUNA_KEY;
const ADZUNA_ID = process.env.ADZUNA_ID;
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

//console.log('ADZUNA_ID:', process.env.ADZUNA_ID);
//console.log('ADZUNA_KEY:', process.env.ADZUNA_KEY);
const upload = multer({ dest: 'uploads/' });

// Utility function to extract skills from text
function extractSkills(text) {
  const skillsList = [
  'JavaScript', 'Node.js', 'React', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'MongoDB',
  'C++', 'C#', 'HTML', 'CSS', 'TypeScript', 'Angular', 'Vue', 'Express', 'Spring', 'Kotlin'
];
  const foundSkills = [];
  const lowerText = text.toLowerCase();

  for (const skill of skillsList) {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }
  return foundSkills;
}

// GET /jobs?query=...
router.get('/', async (req, res) => {
  //console.log("GET /jobs route hit");

  const { query = 'developer', country = 'in', page = 1, results_per_page = 10 } = req.query;

  try {
    const response = await axios.get(`${ADZUNA_BASE_URL}/${country}/search/${page}`, {
      params: {
        app_id: ADZUNA_ID,
        app_key: ADZUNA_KEY,
        what: query,
        results_per_page,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
  //console.error('Error fetching jobs from Adzuna:', error.message);
  res.status(500).json({ message: 'Failed to fetch jobs from Adzuna.' });
}
});


// POST /jobs/scan-resume — upload file, OCR, extract skills, search jobs
router.post('/scan-resume', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const filePath = path.join('uploads', req.file.filename);
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');

    const ext = path.extname(req.file.originalname).toLowerCase();
    const mimeType = ext === '.pdf' ? 'application/pdf' : 'image/jpeg';

    // Call OCR API
    const ocrResponse = await axios.post(
      'https://api.ocr.space/parse/image',
      new URLSearchParams({
        language: 'eng',
        isOverlayRequired: 'false',
        base64Image: `data:${mimeType};base64,${base64Image}`
      }),
      {
        headers: {
          apikey: process.env.OCR_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const parsedText = ocrResponse.data?.ParsedResults?.[0]?.ParsedText || '';
    //console.log('Extracted Text:', parsedText);

    const skills = extractSkills(parsedText);
    const skillQuery = skills.length > 0 ? skills[0] : 'developer';
    //console.log('Adzuna Query:', skillQuery);
    // Search jobs based on extracted skills
    const jobResponse = await axios.get(`${ADZUNA_BASE_URL}/in/search/1`, {
      params: {
        app_id: ADZUNA_ID,
        app_key: ADZUNA_KEY,
        what: skillQuery,
        results_per_page: 10,
      },
    });


    fs.unlinkSync(filePath); // Remove temp file

    res.status(200).json({
      extractedSkills: skills,
      jobs: jobResponse.data?.results || [],
    });
    //console.log('Adzuna Jobs:', jobResponse.data?.results);
  } catch (err) {
    console.error('Scan error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to scan and search jobs.', details: err.message });
  }
});

export default router;
