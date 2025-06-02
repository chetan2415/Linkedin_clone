import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet's default icon path
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

function JobsMap({ userLocation, jobsNearYou }) {
  useEffect(() => {
    // Only run once on mount
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x.src || markerIcon2x,
      iconUrl: markerIcon.src || markerIcon,
      shadowUrl: markerShadow.src || markerShadow,
    });
  }, []);

  return (
    <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={11} style={{height: 400, width: "100%", margin: "2rem 0", borderRadius: "8px"}}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>You are here</Popup>
      </Marker>
      {jobsNearYou
        .filter(job =>
          typeof job.latitude === "number" &&
          typeof job.longitude === "number" &&
          !isNaN(job.latitude) &&
          !isNaN(job.longitude)
        )
        .map((job, idx) => (
          <Marker key={idx} position={[job.latitude, job.longitude]}>
            <Popup>
              <strong>{job.title}</strong><br/>
              {job.company?.display_name}<br/>
              <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">Apply</a>
            </Popup>
          </Marker>
      ))}
    </MapContainer>
  );
}

export default JobsMap;