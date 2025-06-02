import React, { useState } from 'react';
import { useRouter } from 'next/router';

import styles from "./business.module.css";

function Business() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const businessItems = [
    { name: "My Apps" },
    { name: "Find New Clients" },
    { name: "Groups" },
    { name: "Talent" },
    { name: "Talent Insights" },
    { name: "Post a Job" },
    { name: "Sales" },
    { name: "Services Marketplace" },
    { name: "Marketing" },
    { name: "Advertise" },
    { name: "Learning" },
    { name: "Admin Center" },
    { name: "Create a Company Page" }
  ];

  // Filter business items based on search query
  const filteredBusinessItems = businessItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBoxClick = (type) => {
  const routes = {
    "Talent": "https://www.linkedin.com/talent",
    "Sales": "https://www.linkedin.com/sales/solutions",
    "Post a Job": "https://www.linkedin.com/talent/post-a-job",
    "Advertise": "https://www.linkedin.com/ad/start",
    "Small Business": "https://www.linkedin.com/business/small-business",
    "Learning": "https://www.linkedin.com/learning"
  };

  const url = routes[type];
  if (url) {
    window.location.href = url;
  } else {
    alert("Page not defined");
  }
};


  return (
    <div className={styles.business}>
      <h2>Explore more for business</h2>

      {/* Search Bar */}
      <div className={styles.BussSearchBar}>
        <input
          type="text"
          placeholder="Search for a business item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.BussSearchInput}
        />
        <button className={styles.searchBuss}>Search</button>
      </div>
        <hr style={{marginBottom:"1.5rem", opacity:"0.5"}}/>
      <div className={styles.businessGrid}>
        {filteredBusinessItems.map((item, index) => (
          <div className={styles.businessItem} key={index}>
            <h4>{item.name}</h4>
          </div>
        ))}
      </div>

      <h2>Hire on LinkedIn</h2>
      <div className={styles.businessDetails}>
       <div className={styles.businessBox} onClick={() => handleBoxClick("Talent")}>
          <h3>Find, attract, and recruit talent</h3>
        </div>
        <div className={styles.businessBox} onClick={() => handleBoxClick("Sales")}>
          <h3>Sell with LinkedIn</h3>
          <p>Unlock sales opportunities</p>
        </div>
        <div className={styles.businessBox} onClick={() => handleBoxClick("Post a Job")}>
          <h3>Post a job for free</h3>
          <p>Get qualified applicants quickly</p>
        </div>
        <div className={styles.businessBox} onClick={() => handleBoxClick("Advertise")}>
          <h3>Advertise on LinkedIn</h3>
          <p>Acquire customers and grow your business</p>
        </div>
        <div className={styles.businessBox} onClick={() => handleBoxClick("Small Business")}>
          <h3>Elevate your small business</h3>
          <p>Find new clients and build credibility</p>
        </div>
        <div className={styles.businessBox} onClick={() => handleBoxClick("Learning")}>
          <h3>Learn with LinkedIn</h3>
          <p>Courses to develop your employees</p>
        </div>
      </div>
    </div>
  );
}

export default Business;
