import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./Resume.module.css";
import { createResume, getResume } from "../../config/redux/action/resumeAction";
import { useDispatch, useSelector } from "react-redux";

export default function ResumeHeader() {
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const router = useRouter();

  const messages = [
    "You can download your resume now.",
    "You can add your resume in AI for more information.",
  ];

  const { resumeId, successMessage, isError, errorMessage } = useSelector((state) => state.resume);
  //const user = useSelector((state) => state.auth?.user);

  const [showMenu, setShowMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  const defaultExperience = { title: "", company: "", duration: "", description: "" };
  const defaultEducation = { degree: "", school: "", year: "" };
  const defaultCertification = { title: "", issuer: "" };
  const defaultProject = { title: "", description: "", tech: "" };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    summary: "",
    skills: "",
    experience: [defaultExperience],
    education: [defaultEducation],
    certifications: [defaultCertification],
    projects: [defaultProject],
    templateType: "professional",
  });

  useEffect(() => {
    if (!showNotification) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showNotification]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e, field, index, section) => {
    if (section) {
      const updatedSection = [...formData[section]];
      updatedSection[index][field] = e.target.value;
      setFormData({ ...formData, [section]: updatedSection });
    } else {
      setFormData({ ...formData, [field]: e.target.value });
    }
  };

  const addSectionItem = (section, defaultItem) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], { ...defaultItem }],
    }));
  };

  const isFormValid = () => {
    const {
      name, email, phone, linkedin, github, summary, skills,
      experience, education, certifications, projects,
    } = formData;

    if (!name || !email || !phone || !linkedin || !github || !summary || !skills) return false;

    const hasExperience = experience.every(exp => exp.title && exp.company && exp.duration && exp.description);
    const hasEducation = education.every(edu => edu.degree && edu.school && edu.year);
    const hasCertifications = certifications.every(cert => cert.title && cert.issuer);
    const hasProjects = projects.every(proj => proj.title && proj.description && proj.tech);

    return hasExperience && hasEducation && hasCertifications && hasProjects;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

   const payload = {
    contact: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      linkedin: formData.linkedin,
      github: formData.github,
    },
    summary: formData.summary,
    skills: formData.skills.split(",").map((s) => s.trim()),
    experience: formData.experience,
    education: formData.education,
    certifications: formData.certifications,
    projects: formData.projects,
    templateType: formData.templateType,
  };
  
  try {
    const action = await dispatch(createResume(payload));
    const resume = action.payload;
    const newResumeId = resume?._id || resume?.resume?._id;

    if (newResumeId && typeof newResumeId === 'string') {
      localStorage.setItem("resumeId", newResumeId); 
      router.push(`/Resume/${newResumeId}`);
      alert("Resume created successfully!");

      // Clear the form
      setFormData({
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        github: "",
        summary: "",
        skills: "",
        experience: [defaultExperience],
        education: [defaultEducation],
        certifications: [defaultCertification],
        projects: [defaultProject],
        templateType: "professional",
      });

      // Optional: you can redirect if needed
      // router.push(`/resume/${newResumeId}`);
    } else {
      alert("Resume created, but no ID returned.");
    }
  } catch (err) {
    console.error("Error creating resume:", err);
    alert("Something went wrong.");
  }
};

const handleGetMyResume = async () => {
  const resumeId = localStorage.getItem("resumeId");

  if (!resumeId) {
    alert("No resume ID found. Please create one first.");
    return;
  }

  try {
     console.log("Current resumeId:", resumeId);
    const action = await dispatch(getResume(resumeId));
    const resumeData = action.payload;

    if (resumeData?._id) {
      router.push(`/Resume/${resumeData._id}`);
    } else {
      alert("Resume not found or invalid format.");
    }
  } catch (error) {
    console.error("Failed to fetch resume:", error);
    alert("Error fetching your resume.");
  }
};


  return (
    <>
      {successMessage && <div className={styles.ResumeMessages}>{successMessage}</div>}
      {isError && <div style={{ color: "red", marginBottom: "1rem" }}>{errorMessage || "Something went wrong"}</div>}

      <div className={styles.ResumeContainer}>
        <h4 className={styles.ResumeHeading}>Build Your Resume</h4>
        <div className={styles.controls} ref={menuRef}>
          <button
            title="menu"
            className={styles.dots}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
          >
            ...
          </button>

          <button
            title="close"
            className={styles.ResumeCross}
            onClick={() => router.push("/dashboard")}
          >
            X
          </button>

          {showMenu && (
            <div className={styles.dropdownMenu}>
              <button>Update</button>
              <button onClick={handleGetMyResume}>Get my Resumes</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.ResumeForm}>
        <form onSubmit={handleSubmit}>
          <h2>Personal Information</h2>
          <input placeholder="Full Name" value={formData.name} onChange={(e) => handleChange(e, "name")} />
          <input placeholder="Email" value={formData.email} onChange={(e) => handleChange(e, "email")} />
          <input placeholder="Phone" value={formData.phone} onChange={(e) => handleChange(e, "phone")} />
          <input placeholder="LinkedIn" value={formData.linkedin} onChange={(e) => handleChange(e, "linkedin")} />
          <input placeholder="GitHub" value={formData.github} onChange={(e) => handleChange(e, "github")} />

          <h2>Summary</h2>
          <textarea placeholder="Professional Summary" value={formData.summary} onChange={(e) => handleChange(e, "summary")} />

          <h2>Skills</h2>
          <input placeholder="Skills (comma separated)" value={formData.skills} onChange={(e) => handleChange(e, "skills")} />

          <h2>Experience</h2>
          {formData.experience.map((exp, idx) => (
            <div key={idx}>
              <input placeholder="Title" value={exp.title} onChange={(e) => handleChange(e, "title", idx, "experience")} />
              <input placeholder="Company" value={exp.company} onChange={(e) => handleChange(e, "company", idx, "experience")} />
              <input placeholder="Duration" value={exp.duration} onChange={(e) => handleChange(e, "duration", idx, "experience")} />
              <textarea placeholder="Description" value={exp.description} onChange={(e) => handleChange(e, "description", idx, "experience")} />
            </div>
          ))}

          <h2>Education</h2>
          {formData.education.map((edu, idx) => (
            <div key={idx}>
              <input placeholder="Degree" value={edu.degree} onChange={(e) => handleChange(e, "degree", idx, "education")} />
              <input placeholder="School" value={edu.school} onChange={(e) => handleChange(e, "school", idx, "education")} />
              <input placeholder="Year" value={edu.year} onChange={(e) => handleChange(e, "year", idx, "education")} />
            </div>
          ))}

          <h2>Certifications</h2>
          {formData.certifications.map((cert, idx) => (
            <div key={idx}>
              <input placeholder="Title" value={cert.title} onChange={(e) => handleChange(e, "title", idx, "certifications")} />
              <input placeholder="Issuer" value={cert.issuer} onChange={(e) => handleChange(e, "issuer", idx, "certifications")} />
            </div>
          ))}

          <h2>Projects</h2>
          {formData.projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
              <input placeholder="Project Title" value={proj.title} onChange={(e) => handleChange(e, "title", idx, "projects")} />
              <textarea placeholder="Description" value={proj.description} onChange={(e) => handleChange(e, "description", idx, "projects")} />
              <input placeholder="Technologies Used" value={proj.tech} onChange={(e) => handleChange(e, "tech", idx, "projects")} />
            </div>
          ))}
          <button type="button" className={styles.ResumeBtn} onClick={() => addSectionItem("projects", defaultProject)}>
            Add Project
          </button>

          <button type="submit" className={styles.ResumeBtn} disabled={!isFormValid()}>
            Create Resume
          </button>
        </form>
      </div>

      {showNotification && (
        <div className={styles.notification}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p>{messages[messageIndex]}</p>
            <button
              onClick={() => setShowNotification(false)}
              style={{ background: "none", border: "none", fontWeight: "bold", cursor: "pointer" }}
            >X</button>
          </div>
        </div>
      )}
  
    </>
  );
}
