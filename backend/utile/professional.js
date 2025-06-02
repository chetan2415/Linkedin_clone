import fs from "fs";
import crypto from "crypto";
import puppeteer from "puppeteer";

const professionalTemplate = async (resume) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate the HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Professional Resume</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica', sans-serif; background-color: #fff; color: #333; padding: 50px; line-height: 1.5; }
            .header { text-align: left; margin-bottom: 20px; }
            .header h1 { font-size: 2.5em; font-weight: bold; color: #000; margin-bottom: 0.5em; }
            .header .role { font-size: 1.2em; color: #555; margin-bottom: 1em; }
            .contact-info { font-size: 0.9em; color: #333; }
            .contact-info p { margin-bottom: 0.3em; }
            .divider { width: 100%; height: 1px; background-color: #aaa; margin: 20px 0; }
            .section { margin-bottom: 30px; }
            .section h2 { font-size: 1.3em; color: #003366; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; border-bottom: 2px solid #003366; padding-bottom: 5px; }
            .section p { font-size: 1em; color: #333; margin-bottom: 1em; }
            .skills-list, .projects-list { list-style: none; margin: 0; padding: 0; }
            .skills-list li, .projects-list li { display: inline-block; font-size: 1em; margin-right: 10px; margin-bottom: 5px; }
            .skills-list li::after { content: '|'; margin-left: 10px; }
            .skills-list li:last-child::after { content: ''; }
            .project-title { font-weight: bold; font-size: 1.2em; }
            .project-tech { font-style: italic; color: #555; }
            .education, .certifications { font-size: 1em; margin-bottom: 10px; }
            .education span, .certifications span { font-weight: bold; }
          </style>
        </head>
        <body>

          <div class="header">
            <h1>${resume.contact.name}</h1>
            <div class="role">${resume.contact.role || "UX DESIGNER"}</div>
            <div class="contact-info">
              <p>Email: ${resume.contact.email}</p>
              <p>Phone: ${resume.contact.phone}</p>
              <p>GitHub: ${resume.contact.github || ""}</p>
              <p>LinkedIn: ${resume.contact.linkedin || ""}</p>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <h2>Summary</h2>
            <p>${resume.summary || "No summary available."}</p>
          </div>

          <div class="section">
            <h2>Technical Skills</h2>
            <ul class="skills-list">
              ${resume.skills?.map(skill => `<li>${skill}</li>`).join("")}
            </ul>
          </div>

          <div class="section">
            <h2>Professional Experience</h2>
            ${resume.experience?.map(exp => `
              <div class="experience-item">
                <h3>${exp.title}, ${exp.company} (${exp.duration || "N/A"})</h3>
                <p>${exp.description}</p>
              </div>
            `).join("")}
          </div>

          <div class="section">
            <h2>Education</h2>
            ${resume.education?.map(edu => `
              <p><span>${edu.degree}</span> - ${edu.school} (${edu.year})</p>
            `).join("")}
          </div>

          <div class="section">
            <h2>Certifications</h2>
            ${resume.certifications?.map(cert => `
              <p><span>${cert.title}</span> - ${cert.issuer}</p>
            `).join("")}
          </div>

          <div class="section">
            <h2>Projects</h2>
            <ul class="projects-list">
              ${resume.projects?.map(proj => `
                <li>
                  <div class="project-title">${proj.title}</div>
                  <p>${proj.description}</p>
                  <p class="project-tech">Tech: ${proj.tech}</p>
                </li>
              `).join("")}
            </ul>
          </div>

        </body>
        </html>
      `;

      // Launch Puppeteer to convert HTML to PDF
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const fileName = `uploads/${resume.contact.name.replace(/\s+/g, "_")}_${crypto.randomBytes(4).toString("hex")}.pdf`;

      // Save the PDF
      await page.pdf({ path: fileName, format: "A4" });

      await browser.close();

      resolve(fileName);
    } catch (err) {
      reject(err);
    }
  });
};

export default professionalTemplate;
