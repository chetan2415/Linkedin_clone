import PDFDocument from "pdfkit";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import sharp from "sharp";

const convertUserDatatoPDF = async (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userData || !userData.userId) {
        return reject(new Error("Invalid user data"));
      }

      const doc = new PDFDocument();
      const outputPath = `uploads/${userData.userId.username}_${crypto.randomBytes(8).toString("hex")}.pdf`;
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // Add user's profile picture
      if (userData.userId.profilePicture) {
        const imagePath = path.join("uploads", userData.userId.profilePicture);
        const convertedImagePath = imagePath.replace(path.extname(imagePath), ".png");

        try {
          // Convert image to PNG
          await sharp(imagePath).toFormat("png").toFile(convertedImagePath);

          // Add to PDF
          doc.image(convertedImagePath, {
            align: "center",
            width: 100,
          });

          // Cleanup converted PNG after stream finishes
          stream.on("finish", () => {
            fs.unlink(convertedImagePath, (err) => {
              if (err) console.warn("Failed to delete temp image:", err.message);
            });
          });
        } catch (error) {
          console.error(`Error adding image: ${imagePath}`, error.message);
          doc.fontSize(14).text("Profile picture not available", { align: "center" });
        }
      } else {
        doc.fontSize(14).text("Profile picture not available", { align: "center" });
      }

      // Add user's basic details
      doc.fontSize(20).text(userData.userId.name, { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Username: ${userData.userId.username}`);
      doc.text(`Email: ${userData.userId.email}`);
      doc.moveDown();

      // Add user's bio
      if (userData.bio) {
        doc.fontSize(16).text("Bio:", { underline: true });
        doc.fontSize(14).text(userData.bio);
        doc.moveDown();
      }

      // Add user's current position
      if (userData.currentPosition) {
        doc.fontSize(16).text("Current Position:", { underline: true });
        doc.fontSize(14).text(userData.currentPosition);
        doc.moveDown();
      }

      // Add user's past work experience
      if (userData.pastWork && userData.pastWork.length > 0) {
        doc.fontSize(16).text("Past Work Experience:", { underline: true });
        userData.pastWork.forEach((work) => {
          doc.fontSize(14).text(`Company: ${work.company}`);
          doc.text(`Position: ${work.position}`);
          doc.text(`Years: ${work.years}`);
          doc.moveDown();
        });
      }

      // Add user's education
      if (userData.education && userData.education.length > 0) {
        doc.fontSize(16).text("Education:", { underline: true });
        userData.education.forEach((edu) => {
          doc.fontSize(14).text(`School: ${edu.school}`);
          doc.text(`Degree: ${edu.degree}`);
          doc.text(`Field of Study: ${edu.fieldOfStudy}`);
          if (edu.years?.start && edu.years?.end) {
            doc.text(`Years: ${edu.years.start} - ${edu.years.end}`);
          }
          doc.moveDown();
        });
      }

      // Finalize the PDF
      doc.end();

      // Wait until writing is done
      stream.on("finish", () => resolve(outputPath));
      stream.on("error", (err) => {
        console.error("Stream error:", err.message);
        reject(new Error("Failed to write PDF"));
      });

    } catch (error) {
      console.error("Error generating PDF:", error.message);
      reject(new Error("Failed to generate PDF"));
    }
  });
};

export default convertUserDatatoPDF;
