import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import style from './NavSearch.module.css';

function NavSearch() {
  const router = useRouter();
  const { q } = router.query;

  const [jobResults, setJobResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [section, setSection] = useState("Jobs");
  const [aiTip, setAiTip] = useState("");
  const [loadingTip, setLoadingTip] = useState(false);

  // Feature 5: Interview Questions state
  const [questions, setQuestions] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState({});
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);


// Fetch jobs when query changes or section is Jobs
  useEffect(() => {
    if (!q || section !== "Jobs") return;
    const fetchJobs = async (query) => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:9000/jobs', {
          params: {
            query: query,
            country: 'in',
            page: 1, // or allow user to select page
            results_per_page: 20 // optional, default is 10
          }
        });
        setJobResults(response.data.results || []);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        setJobResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs(q);
  }, [q, section]);

  const getAITip = async (prompt) => {
    setLoadingTip(true);
    setAiTip("");
    try {
      const sessionId = localStorage.getItem("sessionId");
      const res = await fetch('http://localhost:9000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          sessionId: sessionId || undefined,
          language: "en"
        })
      });
      const data = await res.json();
      setAiTip(data.reply || "No tip generated.");
    } catch (err) {
      setAiTip("Failed to get tip.");
    }
    setLoadingTip(false);
  };

  // Feature 5: Get Interview Questions
  const getInterviewQuestions = async (jobTitle, index) => {
    setLoadingQuestions(prev => ({ ...prev, [index]: true }));
    try {
      const sessionId = localStorage.getItem("sessionId");
      const res = await fetch('http://localhost:9000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Give me 5 interview questions for the position "${jobTitle}"`,
          sessionId: sessionId || undefined,
          language: "en"
        })
      });
      const data = await res.json();
      setQuestions(prev => ({ ...prev, [index]: data.reply || "No questions generated." }));
    } catch (err) {
      setQuestions(prev => ({ ...prev, [index]: "Failed to get questions." }));
    }
    setLoadingQuestions(prev => ({ ...prev, [index]: false }));
  };

  const toggleReadMore = (index) => {
    setExpandedDesc((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <>
      <div className={style.NavSearchSide}>
        <h4>On this Page</h4>
        <p style={{ color: section === "Jobs" ? "#0073b1" : undefined, cursor: "pointer" }} onClick={() => setSection("Jobs")}>Jobs</p>
        <p style={{ color: section === "Tips" ? "#0073b1" : undefined, cursor: "pointer" }} onClick={() => {
          setSection("Tips");
          if (q) getAITip(`Give me some tips about "${q}"`);
        }}>Tips</p>
      </div>

      <div className={style.NavSearchRes}>
        {section === "Jobs" && (
          <>
            <h3>Showing Jobs for: <em>{q}</em></h3>
            <hr style={{marginTop:"1rem", opacity:"0.6"}}/>
            {loading && <p style={{marginTop:"1rem"}}>Loading jobs...</p>}
            {!loading && jobResults.length === 0 && <p style={{marginTop:"1rem"}}>No jobs found for "{q}"</p>}
            <ul className={style.jobsList}>
              {jobResults.map((job, index) => {
                const desc = job.description || 'No description available';
                const isExpanded = expandedDesc[index];
                const shortDesc = desc.slice(0, 200);

                return (
                  <li key={index} className={style.jobCard}>
                    <h4>{job.title}</h4>
                    <p className={style.company}>
                      <strong>Company:</strong>{" "}
                      <span style={{ color: "#0073b1", cursor: "pointer", textDecoration: "none" }}
                        onClick={() => {
                          setSelectedCompany(job.employer_name);
                          setShowCompanyModal(true);
                        }}>{job.company?.display_name}</span></p>
                    <p className={style.description}>
                      <strong>Description:</strong>{" "}
                      {isExpanded
                        ? <div>
                            {desc.split('\n').map((para, i) => para.trim() ? <p key={i} style={{ margin: 0 }}>{para}</p> : null)}
                          </div>
                        : (<>{shortDesc}{desc.length > 200 ? "..." : ""}</>)
                      }
                      {desc.length > 200 && (
                        <button style={{
                            marginLeft: "0.5rem",
                            color: "#0073b1",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.95em",
                            padding: 0
                          }}
                          onClick={() => toggleReadMore(index)}>
                          {isExpanded ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </p>
                    <p><strong>Location:</strong> {job.location?.display_name || "Not specified"}</p>
                    {/* View on Map */}
                    <div style={{display:"flex", gap:"1rem", alignItems:"center", flexWrap:"wrap", marginTop: "0.5rem"}}>
                        <button style={{
                            color: "black",
                            padding: "0.3rem 0.8rem",
                            border:"none",
                            cursor: "pointer",
                            background: "white",
                            fontFamily:"Plus Jakarta Sans",
                            fontSize:"13.7px",
                            marginTop: "0.3rem",
                          }}onClick={() => getInterviewQuestions(job.job_title, index)}>

                          {loadingQuestions[index] ? "Loading..." : "Show Interview Questions"}
                        </button>
                        {job.location?.display_name && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location.display_name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none", color: "#0073b1", fontFamily:"Plus Jakarta Sans" }}
                          >View on Map </a>
                        )}
                        <a href={job.job_apply_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={style.applyLink}
                          style={{
                            padding: "0.3rem 0.8rem",
                            color: "black",
                            textDecoration: "none",
                            fontFamily:"Plus Jakarta Sans"
                          }}>Apply Now </a>
                      </div>
                      {questions[index] && (
                        <div style={{ marginTop: "0.5rem", background: "#f3f6f8", padding: "0.7rem", borderRadius: "8px",fontFamily:"Plus Jakarta Sans" }}>
                          {questions[index].split('\n').map((q, i) => <p key={i} style={{ margin: "1rem" }}>{q}</p>)}
                        </div>
                      )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {section === "Tips" && (
          <>
            <h3>Tips for: <em>{q}</em></h3>
            {loadingTip && <p style={{marginTop:"1rem"}}>Loading tips...</p>}
            {aiTip && (
              <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: "8px" }}>
                {aiTip.split('\n').map((para, idx) =>
                  <p key={idx} style={{ marginTop:"1rem" }}>{para}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className={style.jobsAlert}>
       <h4 style={{marginTop:0, marginBottom:"1rem"}}>Job Market Analytics</h4>
        <ul style={{paddingLeft: "1.2em", margin: 0}}>
          <li>Total jobs: {jobResults.length}</li>
          <li>Companies: {
            jobResults.map(j => j.employer_name)
              .filter((v, i, a) => a.indexOf(v) === i).length
          }</li>
          <li> Top company: {
              (() => {
                const freq = {};
                jobResults.forEach(j => {
                  freq[j.employer_name] = (freq[j.employer_name] || 0) + 1;
                });
                const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
                return sorted[0]?.[0] || "N/A";
              })()
            }
          </li>
        </ul>
      </div>
      {showCompanyModal && selectedCompany && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowCompanyModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "2rem",
              minWidth: 340,
              maxWidth: 420,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 22,
                cursor: "pointer"
              }}
              onClick={() => setShowCompanyModal(false)}
              aria-label="Close"
            >×</button>
            <h3 style={{marginTop:0}}>{selectedCompany}</h3>
            {/* Mock rating and review, replace with real data if available */}
            <p style={{margin:"0.5em 0"}}>⭐ 4.2/5 (Google)</p>
            <p style={{fontFamily:"Plus Jakarta Sans", color:"#555", marginBottom:"0.5rem"}}>"Great place to work!"</p>
            {/* Website link if available */}
            {jobResults.find(j => j.employer_name === selectedCompany && j.employer_website) && (
              <p>
                <a
                  href={jobResults.find(j => j.employer_name === selectedCompany).employer_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{color:"#0073b1", textDecoration:"none", fontFamily:"Plus Jakarta Sans", marginTop:"1rem"}}
                >
                  Visit Website</a>
              </p>
            )}      
          </div>
        </div>
      )}
    </>
  );
}

export default NavSearch;