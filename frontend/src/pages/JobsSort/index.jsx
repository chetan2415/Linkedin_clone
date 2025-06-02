import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import styles from './JobsSort.module.css';

const JobsMap = dynamic(() => import('./JobsMap'), { ssr: false });

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function JobsSort() {
  const [userLocation, setUserLocation] = useState(null);
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCoords, setSearchCoords] = useState(null);

  // Get user location on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          console.warn("Location access denied.");
        }
      );
    }
  }, []);

  // Fetch jobs from API (initial load or after search)
  const fetchJobs = async (locationQuery = 'developer') => {
    setLoading(true);
    try {
      const response = await axios.get('https://linkedin-clone-1lln.onrender.com/jobs', {
        params: {
          query: locationQuery,
          country: 'in',
          page: 1,
          results_per_page: 10
        }
      });
      setJobsData(response.data.results || []);
    } catch (error) {
      setJobsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Geocode search location to lat/lng and fetch jobs for that city
  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: searchLocation,
          format: 'json',
          limit: 1
        }
      });
      if (res.data && res.data.length > 0) {
        setSearchCoords({
          lat: parseFloat(res.data[0].lat),
          lng: parseFloat(res.data[0].lon)
        });
        // Optionally, fetch jobs for the city name as the query
        await fetchJobs(searchLocation);
        setSearchLocation(""); // Clear input after search
      } else {
        alert('Location not found');
      }
    } catch (err) {
      alert('Failed to find location');
    }
  };

  // Use either user location or searched location for filtering
  const filterCoords = searchCoords || userLocation;

  // Filter jobs near the chosen location
  const jobsNearYou = filterCoords
    ? jobsData.filter(job =>
        typeof job.latitude === "number" &&
        typeof job.longitude === "number" &&
        !isNaN(job.latitude) &&
        !isNaN(job.longitude) &&
        getDistance(filterCoords.lat, filterCoords.lng, job.latitude, job.longitude) < 100
      )
    : [];

  const jobsByCity = searchCoords
    ? jobsData.filter(job =>
        job.location?.display_name &&
        job.location.display_name.toLowerCase().includes(searchLocation.trim().toLowerCase())
      )
    : [];

  const jobsToShow = jobsNearYou.length > 0 ? jobsNearYou : jobsByCity;

  return (
    <>
      <div className={styles.jobsSort}>
        <div style={{margin: "0 auto", padding: "2rem"}}>
          <h4>Jobs Near You (Map Based)</h4>
          <div style={{marginBottom: "2rem"}}>
            <input
              type="text"
              placeholder="Search a city or location..."
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
              style={{
                fontFamily:"Plus Jakarta Sans",
                width:"300px",
                padding: "0.5rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginRight: 8
              }}
            />
            <button
              className={styles.JobSearch}
              onClick={handleLocationSearch}
              style={{padding: "0.5rem 1rem"}}
            >
              Search
            </button>
          </div>
          {filterCoords &&
            typeof filterCoords.lat === "number" &&
            typeof filterCoords.lng === "number" &&
            !isNaN(filterCoords.lat) &&
            !isNaN(filterCoords.lng) ? (
              <JobsMap userLocation={filterCoords} jobsNearYou={jobsNearYou} />
            ) : (
              <p style={{marginBottom:"1rem"}}>Detecting your location...</p>
            )}
          <h4>Jobs Near You (List)</h4>
          {loading && <p>Loading jobs...</p>}
          {jobsNearYou.length === 0 && jobsByCity.length > 0 && (
            <div style={{color: "#0073b1", marginBottom: "1rem"}}>
              Showing jobs in "{searchLocation}" (city match, no map location available).
            </div>
          )}
          <ul>
            {jobsToShow.length === 0 && !loading && <li>No jobs found near this location.</li>}
            {jobsToShow.map((job, idx) => (
              <li key={idx}>
                <strong>{job.title}</strong> at {job.company?.display_name} &mdash; 
                <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" style={{marginLeft: 8}}>Apply</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}