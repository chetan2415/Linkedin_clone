import React, {useEffect, useState} from 'react';
import styles from "./message.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, getMyConnectionsRequest, handleConnectionRequest } from "../../config/redux/action/authAction"; 
import { BASE_URL } from '@/config';
import { useRouter } from "next/router";

function messages() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { pendingRequests,acceptedConnections, isLoading, isError } = useSelector((state) => state.auth);

    const [actionMessage, setActionMessage] = useState("");
 
    useEffect(() => {
        dispatch(getAllUsers());
        dispatch(getMyConnectionsRequest());
    }, [dispatch]);

   const handleAction = (connectionId, action) => {
    //console.log("Handling action:", action, "for connectionId:", connectionId);
    dispatch(handleConnectionRequest({ connectionId, action })).then((result) => {
      if (handleConnectionRequest.fulfilled.match(result)) {
        if (action === "accept") {
          setActionMessage("Connection accepted!");
        } else if (action === "reject") {
          setActionMessage("Connection rejected.");
        } else if (action === "reset") {
          setActionMessage("Connection reset.");
        }
        setTimeout(() => setActionMessage(""), 5000);
      }
      dispatch(getMyConnectionsRequest());
    });
  };    

    const handleDisconnect = async (connectionId) => {
        const confirmed = window.confirm("Do you want to disconnect?");
        if (confirmed) {
          await handleAction(connectionId, "reset");
        }
    };
    const handleProfileClick = (username) => {
        //console.log("Navigating to user profile:", username); 
        router.push(`/userProfile/${username}`);
      };
      
    return ( 
        <>
          <div>
            <div className={styles.messages}>
                <h4>Connection Requests</h4>

                  {isLoading ? (
                      <p>Loading...</p>
                    ) : isError ? (
                      <p>There was an error fetching connections. Please try again later.</p>
                    ) : pendingRequests?.length > 0 ? (
                      pendingRequests.map((req) => (
                        <div key={req._id} className={styles.connectionCard}>
                          <img
                            src={req?.userId?.profilePicture ? `${BASE_URL}/uploads/${req.userId.profilePicture}` : "/default.jpg"}
                            className={styles.profileImage}
                            alt="Profile"
                          />
                          <div className={styles.connectionInfo}>
                            <h3 onClick={() => handleProfileClick(req.userId?.username)} style={{ cursor: "pointer" }}>
                              {req.userId?.name || req.userId?.username || "Unknown User"}
                            </h3>
                            <p>{req.userId?.email || "No email available"}</p>
                            <div className={styles.actionButtons}>
                              <button style={{marginRight:"1rem"}}className={styles.acceptBtn} onClick={() => handleAction(req.userId._id, "accept")}>Accept</button>
                              <button style={{marginRight:"3rem"}}className={styles.rejectBtn} onClick={() => handleAction(req.userId._id, "reject")}>Reject</button>
                              {actionMessage && ( <div className={styles.notification}> {actionMessage} </div>)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No connection requests</p>
                    )}

                  <h4 style={{ marginTop: "2rem" }}>Connected Users</h4>

                  {/* Displaying connected users */}
                  {acceptedConnections?.length > 0 ? (
                        acceptedConnections.map((conn) => {
                          const myId = localStorage.getItem("userId");
                          const otherUser =
                            conn.userId._id === myId ? conn.connectionId : conn.userId;
                
                          return (
                            <div key={conn._id} className={styles.Accconnection}>
                              <img
                                src={otherUser?.profilePicture ? `${BASE_URL}/uploads/${otherUser.profilePicture}` : "/default.jpg" }className={styles.AccprofileImage} alt="Profile" />
                              <div className={styles.connectionInfo}>
                                <h3 onClick={() => handleProfileClick(otherUser?.username)} style={{ cursor: "pointer" }}>
                                  {otherUser?.name || otherUser?.username}
                                </h3>
                                <p>{otherUser?.email}</p>
                                <button className={styles.AccacceptBtn} onClick={() => handleDisconnect(otherUser._id)}>Connected</button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p>No connected users</p>
                      )}

                </div>


                <div className={styles.letters}>
                    <h4 style={{marginLeft:"1rem", marginTop:"1rem", marginBottom:"1rem"}}>Letters</h4>
                    <div className={styles.letter}>
                        <h3>Google</h3>
                        <p>Join Google as a Software Engineer and work on cutting-edge technologies like AI, cloud computing, and search algorithms. Enjoy competitive salaries, stock options, and an inclusive work environment that fosters innovation and learning. Open positions are available in multiple locations, including remote opportunities.</p>
                    </div>
                    <hr/>
                    <div className={styles.letter}>
                        <h3>Amazon</h3>
                        <p>Amazon is hiring developers, analysts, and operations managers to revolutionize e-commerce, cloud services, and AI solutions. Employees enjoy flexible work schedules, health benefits, and leadership training programs. Apply now to be part of a fast-paced, customer-driven environment with a focus on career growth.</p>
                    </div>
                    <hr/>
                    <div className={styles.letter}>
                        <h3>Microsoft</h3>
                        <p>Join Microsoft and work on world-class software, cloud computing, and enterprise solutions. The company offers structured mentorship programs, career development plans, and a collaborative workplace. Be part of a global community focused on empowering people and businesses with technology.</p>
                    </div>
                    <hr/>
                    <div className={styles.letter}>
                        <h3>Meta (Facebook)</h3>
                        <p>Meta is seeking engineers, designers, and analysts to build immersive social experiences in AI, AR/VR, and blockchain. Employees get access to cutting-edge resources, a dynamic work culture, and generous perks like wellness programs, stock benefits, and remote work flexibility.</p>
                    </div>
                    <hr/>
                    <div className={styles.letter}>
                        <h3>IBM</h3>
                        <p>IBM is looking for professionals in AI, cybersecurity, and quantum computing. With an emphasis on research-driven solutions, IBM provides top-tier learning opportunities, diverse projects, and competitive compensation. The company promotes a work-life balance with hybrid and remote job options.</p>
                    </div>
                </div>
                
                <h4 className={styles.eventsHeading}>Events</h4>
                <div className={styles.eventsContainer}>
                    <div className={styles.event}>
                        <h3>Google Developers</h3>
                        <h5>AI & Cloud Summit 2025</h5>
                        <p>April 20, 2025 | 10:00 AM - 5:00 PM | Bengaluru, India</p>
                    </div>

                    <div className={styles.event}>
                        <h3>Microsoft</h3>
                        <h5>TechCon: Future of Software</h5>
                        <p>May 5, 2025 | 9:30 AM - 4:00 PM | Hyderabad, India</p>
                    </div>

                    <div className={styles.event}>
                        <h3>Amazon Web Services</h3>
                        <h5>AWS Cloud Innovation Summit</h5>
                        <p>June 12, 2025 | 11:00 AM - 6:00 PM | Mumbai, India</p>
                    </div>

                    <div className={styles.event}>
                        <h3>Meta (Facebook)</h3>
                        <h5>Metaverse & VR Development</h5>
                        <p>July 8, 2025 | 2:00 PM - 7:00 PM | Online Event</p>
                    </div>

                    <div className={styles.event}>
                        <h3>IBM</h3>
                        <h5>Cybersecurity & AI Ethics</h5>
                        <p>August 15, 2025 | 10:30 AM - 5:30 PM | Pune, India</p>
                    </div>

                    <div className={styles.event}>
                        <h3>Apple</h3>
                        <h5>WWDC 2025: iOS & MacOS Innovations</h5>
                        <p>September 3, 2025 | 9:00 AM - 3:00 PM | California, USA</p>
                    </div>

                    <div className={styles.event}>
                        <h3>Tesla</h3>
                        <h5>Electric Vehicles & AI Automation</h5>
                        <p>October 18, 2025 | 1:00 PM - 6:00 PM | Berlin, Germany</p>
                    </div>

                    <div className={styles.event}>
                        <h3>SpaceX</h3>
                        <h5>Future of Space Travel</h5>
                        <p>November 10, 2025 | 4:00 PM - 9:00 PM | Texas, USA</p>
                    </div>

                    <div className={styles.event}>
                        <h3>Nvidia</h3>
                        <h5>AI & Deep Learning Conference</h5>
                        <p>December 5, 2025 | 10:00 AM - 5:00 PM | San Francisco, USA</p>
                    </div>

                    <div className={styles.event}>
                        <h3>IBM</h3>
                        <h5>AI & hybrid Cloud</h5>
                        <p>June 15, 2025 | 11:00 AM - 6:00 PM | Hyderabad, India</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default messages;