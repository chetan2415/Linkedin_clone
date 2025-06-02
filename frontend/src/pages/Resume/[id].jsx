import { useRouter } from "next/router";
import { useEffect,useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getResume, downloadResume, deleteResume } from "../../config/redux/action/resumeAction";
import styles from "./getResume.module.css";

export default function ResumeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
   const menuRef = useRef(null);

    const [showMenu, setShowMenu] = useState(false);
  const { currentResume, isLoading, isError, errorMessage } = useSelector((state) => state.resume);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    if (id) {
      dispatch(getResume(id));
    }
  }, [id, dispatch]);

  if (isLoading) return <p>Loading resume...</p>;
  if (isError) return console.log("Error occurred:", errorMessage); <p style={{ color: "red" }}>Error: {errorMessage?.message || String(errorMessage)}</p>;
  if (!currentResume) return <p>No resume found.</p>;

  const handleDelete = async () => {
  const confirmDelete = window.confirm("Are you sure you want to delete this resume?");
  if (confirmDelete) {
    const resultAction = await dispatch(deleteResume(id));
    if (deleteResume.fulfilled.match(resultAction)) {
      router.push("/Resume"); // Navigate away after successful delete
    } else {
      alert("Error deleting resume: " + resultAction.payload);
    }
  }
};

  return (
    <>

     <div className={styles.ResumeContainer}>
        <h4 className={styles.ResumeHeading}>My Resume</h4>
        <div className={styles.controls} ref={menuRef}>
          <button
            title="menu"
            className={styles.dots}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}>...</button>

          <button
            title="close"
            className={styles.ResumeCross}
            onClick={() => router.push("/dashboard")}>X</button>

          {showMenu && (
            <div className={styles.dropdownMenu} onMouseDown={(e) => e.stopPropagation()}>
                <button onClick={() => router.push("/Resume")}>Create Resume</button>

                <div className={styles.submenuContainer}>
                <button className={styles.downloadBtn}>Download ▸</button>
                <div className={styles.submenu}>
                    <button onClick={() => dispatch(downloadResume({ id, type: "fresher" }))}>Fresher</button>
                    <button onClick={() => dispatch(downloadResume({ id, type: "professional" }))}>Professional</button>
                </div>
                </div>

                <button onClick={handleDelete} style={{ color: "red" }}>Delete</button>
            </div>
            )}

        </div>
      </div>
     <div className={styles.getContainer}>
     <div className={styles.getHeader}>
        <h1 className={styles.getResumeHeading}>
            {currentResume?.contact?.name || "Unnamed Resume"}
        </h1>
        <p className={styles.getHeaderText}>Email: {currentResume?.contact?.email}</p>
        <p className={styles.getHeaderText}>Phone: {currentResume?.contact?.phone}</p>
        <p className={styles.getHeaderText}>LinkedIn: {currentResume?.contact?.linkedin}</p>
        <p className={styles.getHeaderText}>GitHub: {currentResume?.contact?.github}</p>
        </div>

      <div className={styles.getSection}>
        <h2 className={styles.getSectionHeading}>About Me</h2>
        <p className={styles.getSectionText}>{currentResume?.summary || "Not provided"}</p>
      </div>

      <div className={styles.getSection}>
        <h2 className={styles.getSectionHeading}>Education</h2>
        {currentResume?.education?.length ? (
          currentResume.education.map((edu, i) => (
            <p key={i} className={styles.getSectionText}>
              {edu.degree} - {edu.school} ({edu.year})
            </p>
          ))
        ) : (
          <p className={styles.getSectionText}>No education data</p>
        )}
      </div>

      <div className={styles.getSection}>
        <h2 className={styles.getSectionHeading}>Experience</h2>
        {currentResume?.experience?.length ? (
          currentResume.experience.map((exp, i) => (
            <div key={i} className={styles.getSectionText}>
              <p><strong>{exp.title}</strong> at {exp.company}</p>
              <p>{exp.description}</p>
            </div>
          ))
        ) : (
          <p className={styles.getSectionText}>No experience available</p>
        )}
      </div>

      <div className={styles.getSection}>
        <h2 className={styles.getSectionHeading}>Skills</h2>
        <ul className={styles.getSkillsList}>
          {currentResume?.skills?.length ? (
            currentResume.skills.map((skill, i) => (
              <li key={i} className={styles.getSkillItem}>{skill}</li>
            ))
          ) : (
            <li className={styles.getSkillItem}>No skills available</li>
          )}
        </ul>
      </div>

        <div className={styles.getSection}>
        <h2 className={styles.getSectionHeading}>Projects</h2>
        {currentResume?.projects?.length ? (
            currentResume.projects.map((proj, i) => (
            <div key={i} className={styles.getSectionText}>
                <p><strong>{proj.title}</strong></p>
                <p>{proj.description}</p>
                <p><em>Tech used:</em> {proj.tech}</p>
            </div>
            ))
        ) : (
            <p className={styles.getSectionText}>No projects listed</p>
        )}
        </div>

        <div className={styles.getSection}>
        <h2 className={styles.getSectionHeading}>Certifications</h2>
        {currentResume?.certifications?.length ? (
            currentResume.certifications.map((cert, i) => (
            <p key={i} className={styles.getSectionText}>
                {cert.title} - {cert.issuer}
            </p>
            ))
        ) : (
            <p className={styles.getSectionText}>No certifications listed</p>
        )}
        </div>
    </div>
    </>
  );
}
