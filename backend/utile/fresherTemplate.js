import fs from "fs";
import crypto from "crypto";
import path from "path";
import puppeteer from "puppeteer";

const fresherTemplate = async (resume) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Fresher Resume</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica', sans-serif; background-color: #fff; color: #333; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 2.5em; font-weight: bold; margin-bottom: 0.5em; }
            .header p { font-size: 1.2em; margin-bottom: 5px; }
            .section { margin-bottom: 20px; }
            .section h2 { font-size: 1.5em; font-weight: bold; text-decoration: underline; margin-bottom: 10px; }
            .section p { font-size: 1.1em; margin-bottom: 10px; }
            .skills-list { list-style: none; padding: 0; }
            .skills-list li { display: inline-block; margin-right: 10px; font-size: 1.1em; }
          </style>
        </head>
        <body>

          <div class="header">
            <h1>${resume.contact.name}</h1>
            <p>${resume.contact.email}</p>
            <p>${resume.contact.phone}</p>
            <p>${resume.contact.linkedin || ''}</p>
          </div>

          <div class="section">
            <h2>About Me</h2>
            <p>${resume.summary || "Not provided"}</p>
          </div>

          <div class="section">
            <h2>Education</h2>
            ${resume.education.length > 0 ? resume.education.map(edu => `
              <p>${edu.degree} - ${edu.school} (${edu.year})</p>
            `).join('') : ''}
          </div>

          <div class="section">
            <h2>Experience</h2>
            ${resume.experience.length > 0 ? resume.experience.map(exp => `
              <p><strong>${exp.title}</strong> at ${exp.company}</p>
              <p>${exp.description}</p>
            `).join('') : 'No experience available'}
          </div>

          <div class="section">
            <h2>Skills</h2>
            <ul class="skills-list">
              ${resume.skills.length > 0 ? resume.skills.map(skill => `
                <li>${skill}</li>
              `).join('') : 'No skills available'}
            </ul>
          </div>

        </body>
        </html>
      `;

      // Launch Puppeteer to render HTML to PDF
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      
      // Generate the unique filename
      const fileName = `resume_${crypto.randomBytes(5).toString("hex")}.pdf`;
      const outputPath = path.join("uploads", fileName);
      
      // Save the PDF
      await page.pdf({ path: outputPath, format: "A4" });

      await browser.close();

      resolve(outputPath);
    } catch (err) {
      reject(err);
    }
  });
};

export default fresherTemplate;
