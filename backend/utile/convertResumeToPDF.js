import fresherTemplate from "./fresherTemplate.js";
import professionalTemplate from "./professional.js";

const convertResumeToPDF = async (resume, type) => {
  if (type === "fresher") {
    return await fresherTemplate(resume);
  } else {
    return await professionalTemplate(resume);
  }
};

export default convertResumeToPDF;
