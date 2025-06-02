import React, { useState } from 'react';
import styles from "./jobs.module.css";
import { useSelector } from "react-redux";
import axios from "axios";

function Jobs() {
  const user = useSelector((state) => state.auth.user);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jobResults, setJobResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedJob, setExpandedJob] = useState(null);

  const categories = [
    "remote",
    "marketing manager",
    "hr",
    "legal",
    "sales",
    "amazon",
    "google"
  ];

  const fetchJobs = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:9000/jobs', {
        params: {
           query: query,
            country: 'in',
            page: 1, 
            results_per_page: 20   
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

  const handleCategoryClick = (category) => {
    if (category === selectedCategory) {
      setSelectedCategory(null);
      setJobResults([]);
      return;
    }
    setSelectedCategory(category);
    fetchJobs(category);
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      setSelectedCategory(null); // clear category selection
      fetchJobs(searchQuery.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      <div className={styles.jobs}>
        <div className={styles.jobsPro}>
          <h3>Hi {user?.name}, are you hiring?</h3>
          <p>Post a free job and add the #Hiring frame to your profile to make a hire, fast.</p>
          <button onClick={() => window.open("https://employers.indeed.com/", "_blank")}>Yes, I'm hiring</button>
          <button>No, not now</button>
        </div>
      </div>

      <div className={styles.jobSearch}>
        <h3>Suggested job searches</h3>

        <div className={styles.jobsearchBar}>
          <input
            type="text"
            placeholder="Search for a job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className={styles.jobsearchInput}/>
          <button onClick={handleSearch}>Search</button>
        </div>

        {categories.map((cat, index) => (
          <button key={index}
            className={selectedCategory === cat ? styles.active : ""}
            onClick={() => handleCategoryClick(cat)}> {cat} </button>
        ))}
      </div>

      <div className={styles.work}>
        <h3>Top job picks for you</h3>
        <p>Based on your profile, preferences, and activity like applies, searches, and saves</p>
        <hr style={{marginBottom:"5px"}}/>
        {loading && <p>Loading jobs...</p>}
        {jobResults.length === 0 && !loading && <p>No jobs found. Try a different search.</p>}

        {jobResults.map((job, idx) => (
          <div className={styles.job} key={idx}>
            <h4>{job.title}</h4>
            <p style={{ marginTop: "10px" }}>
              {job.company?.display_name} · {job.location?.display_name}
            </p>
            <p>
              {expandedJob === idx ? job.description : `${job.description?.slice(0, 150)}...`}
              {job.description && job.description.length > 150 && (
                <button style={{ marginLeft: 8, color: "#0073b1", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => setExpandedJob(expandedJob === idx ? null : idx)}>
                  {expandedJob === idx ? "Show less" : "Read more"}
                </button>
              )}
            </p>
            <a href={job.redirect_url} target="_blank" rel="noreferrer" className={styles.apply}>Apply</a>
            <hr style={{ marginTop: "10px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Jobs;
