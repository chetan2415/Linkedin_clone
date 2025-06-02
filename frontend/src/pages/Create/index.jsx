import React, { useState, useEffect, menuRef } from "react";
import { useRouter } from "next/router";
import styles from "./create.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getMyConnectionsRequest, getUserAndProfile, whatAreMyConnections } from "../../config/redux/action/authAction";
import { BASE_URL } from "@/config";
import { getAllPosts, deletePost } from "../../config/redux/action/postAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { getTimeAgo } from "../utile";

// --- Gallery component for selected post ---
function PostGallery({ post }) {
  // Support both array and single string for backward compatibility
  const mediaArr = Array.isArray(post.media) ? post.media : [post.media];
  const fileTypeArr = Array.isArray(post.fileType) ? post.fileType : [post.fileType];
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!mediaArr || mediaArr.length === 0) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + mediaArr.length) % mediaArr.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % mediaArr.length);
  };

  return (
    <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
      {mediaArr.length > 1 && (
        <button
          onClick={handlePrev}
          style={{ position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            background: "rgba(255,255,255,0.7)",
            border: "none",
            fontSize: "2rem",
            cursor: "pointer"}}>&#8592;</button>
      )}

      {fileTypeArr[currentIdx] && fileTypeArr[currentIdx].startsWith("video") ? (
        <video controls width="100%" className={styles.postImage}>
          <source src={`${BASE_URL}/uploads/${mediaArr[currentIdx]}`} type={fileTypeArr[currentIdx]} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={`${BASE_URL}/uploads/${mediaArr[currentIdx]}`}
          alt="Post"
          className={styles.postImage}
          style={{ maxHeight: "400px", objectFit: "contain" }}
        />
      )}

      {mediaArr.length > 1 && (
        <button
          onClick={handleNext}
          style={{ position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            background: "rgba(255,255,255,0.7)",
            border: "none",
            fontSize: "2rem",
            cursor: "pointer"
          }}>&#8594;</button>
      )}

      {/* Dots for navigation */}
      {mediaArr.length > 1 && (
        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
          {mediaArr.map((_, idx) => (
            <span key={idx}
              style={{
                cursor: "pointer",
                fontSize: "1.2rem",
                color: currentIdx === idx ? "#0073b1" : "#bbb",
                margin: "0 2px"
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIdx(idx);
              }}>●</span>
          ))}
        </div>
      )}
    </div>
  );
}


function Create() {
  const router = useRouter();
  const dispatch = useDispatch();
  const menuRef = React.useRef(null);
  const user = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.auth.profile);
  const posts = useSelector((state) => state.post.posts);
  const { myConnections } = useSelector((state) => state.auth);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [activeSection, setActiveSection] = useState(null); // "connections" | "posts" | null
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const selectedPost = posts.find(post => post._id === selectedPostId);

  const myPosts = posts.filter((post) =>
    post.userId === profile.userId?._id || post.userId?._id === profile.userId?._id);

  // Fetch user, profile, connections, and posts on component mount
  useEffect(() => {
    dispatch(getUserAndProfile());
    dispatch(getMyConnectionsRequest());
    dispatch(getAllPosts());
    dispatch(whatAreMyConnections());
  }, [dispatch]);

  ///notification messages
  const messages = [
  "Tip: Keep your profile updated for better networking.",
  "Use AI to improve your profile summary and stand out!",
  "Let AI help you rewrite your About section for more impact.",
  "Ask AI to enhance your work experience descriptions.",
  "Click 'Improve with AI' to get personalized profile suggestions.",
  "Want a stronger profile? Let AI suggest changes for you.",
  "Use AI to make your profile more attractive to recruiters.",
  "Not sure what to write? Ask AI to help you fill out your profile.",
  "Try our AI tools to polish your LinkedIn-style profile!"
  ];

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

  // Toggle connections section
  const handleToggleConnections = () => {
    setActiveSection(prev => (prev === "connections" ? null : "connections"));
  };

  // Toggle posts section
  const handleTogglePosts = () => {
    setActiveSection(prev => (prev === "posts" ? null : "posts"));
    if (activeSection !== "posts") {
      dispatch(getAllPosts());
    }
  };

  // Handle post deletion
  const handleDelete = (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this post?");
    if (isConfirmed) {
      dispatch(deletePost(id));
    }
  };

  // Close selected post when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setSelectedPostId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Navigate to a specific user's profile
  const handleProfileClick2 = (username) => {
    router.push(`/userProfile/${username}`);
  };

  return (
    <>
      <div className={styles.create}>
        <div className={styles.BackGroundImgCre}>
          <img
            key={user?.backgroundImage}
            src={
              user?.backgroundImage
                ? `${BASE_URL}/uploads/${user.backgroundImage}?t=${Date.now()}`
                : "/default.jpg"
            }
            alt="Background"
            style={{ objectFit: "cover", height: "190px", width: "837px", borderRadius: "8px" }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <div className={styles.avatarWrapper2}>
            <div className={styles.editPro2}>
              <img
                key={user?.profilePicture}
                src={
                  user?.profilePicture
                    ? `${BASE_URL}/uploads/${user.profilePicture}?t=${Date.now()}`
                    : "/default.jpg"
                }
                alt="Avatar"
                style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "70%" }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "-1rem" }}>
          <form className={styles.form}>
            <div className={styles.section}>
              <h3 style={{ color: "black", marginTop: "1.4rem" }}>{user?.name}</h3>
            </div>

            {/* About Section with Read More */}
            <div className={styles.section}>
              <h3>About: </h3>
              {profile?.bio ? (
                showFullProfile ? (
                  profile.bio.split('\n').map((para, idx) => (
                    <p key={idx} style={{ marginTop: "1rem" }}>{para}</p>
                  ))
                ) : (
                  <>
                    <p style={{ marginTop: "1rem" }}>{profile.bio.split('\n')[0]}</p>
                    {profile.bio.split('\n').length > 1 && (
                      <button style={{
                          marginTop: "1.5rem",
                          color: "#0073b1",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: "14px"
                        }}
                        onClick={e => {
                          e.preventDefault();
                          setShowFullProfile(true);
                        }}>Read More</button>
                    )}
                  </>
                )
              ) : (
                <p>Not provided</p>
              )}
            </div>

            {/* Show the rest only if showFullProfile is true */}
            {showFullProfile && (
              <>
                <div className={styles.section}>
                  <h3>{profile?.currentPosition || "Not provided"}</h3>
                </div>

                <div className={styles.section}>
                  <h3>Education</h3>
                  {profile?.education?.length ? (
                    profile.education.map((edu, idx) => (
                      <div key={idx} className={styles.eduEntry}>
                        <p><strong>School:</strong> {edu.school}</p>
                        <p><strong>Degree:</strong> {edu.degree}</p>
                        <p><strong>Field:</strong> {edu.fieldOfStudy}</p>
                        <p><strong>Years:</strong> {edu.years?.start} - {edu.years?.end}</p>
                      </div>
                    ))
                  ) : (
                    <p>No education data</p>
                  )}
                </div>

                <div className={styles.section}>
                  <h3>Past Work</h3>
                  {profile?.pastWork?.length ? (
                    profile.pastWork.map((job, idx) => (
                      <div key={idx} className={styles.workEntry}>
                        <p><strong>Company:</strong> {job.company}</p>
                        <p><strong>Position:</strong> {job.position}</p>
                        <p><strong>Years:</strong> {job.years}</p>
                      </div>
                    ))
                  ) : (
                    <p>No work experience</p>
                  )}
                </div>
                <button style={{
                    marginTop: "1rem",
                    color: "#0073b1",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "14px"
                  }}
                  onClick={e => {
                    e.preventDefault();
                    setShowFullProfile(false);
                  }}>Show Less</button></>
            )}
          </form>
        </div>
      </div>

      {/* Buttons */}
      <div className={styles.section}>
        <button className={styles.showConnectionsBtn} onClick={handleToggleConnections}>
          {activeSection === "connections" ? "Hide" : "Show"} Connections ({myConnections?.length || 0})
        </button>

        <button className={styles.postsAndDel} onClick={handleTogglePosts}>
          {activeSection === "posts" ? "Hide" : "Show"} Posts
        </button>
      </div>

      {/* Connections List */}
      {activeSection === "connections" && (
        <div className={styles.connectionsList}>
          {myConnections?.length > 0 ? (
            myConnections.map((conn, index) => (
              <div key={index} className={styles.connectionCard}
                onClick={() => { handleProfileClick2(conn._id); }}
                style={{ cursor: "pointer" }} >
                <img
                  src={
                    conn?.profilePicture
                      ? `${BASE_URL}/uploads/${conn.profilePicture}`
                      : "/default.jpg"
                  }
                  alt="avatar"
                  width="40"
                  style={{ borderRadius: "50%", marginRight: "1rem" }}
                />
                <div>
                  <p><strong>{conn?.name || conn?.username}</strong></p>
                  <p>{conn?.email}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No connections available</p>
          )}
        </div>
      )}

      {/* Posts Section */}
      {activeSection === "posts" && (
        <div className={styles.postsContainer}>
          {myPosts.length > 0 ? (
            myPosts.map((post) => {
              // Show first media as thumbnail
              const fileType = Array.isArray(post.fileType) ? post.fileType[0] : post.fileType;
              const media = Array.isArray(post.media) ? post.media[0] : post.media;
              return (
                <div key={post._id} className={styles.postCard}
                  onClick={(e) => { e.stopPropagation(); setSelectedPostId(post._id); }}>
                  {fileType && fileType.startsWith("video") ? (
                    <video
                      src={`${BASE_URL}/uploads/${media}`}
                      className={styles.postMedia}
                      style={{ width: "100%", height: "auto" }}
                      controls
                    />
                  ) : (
                    <img
                      src={`${BASE_URL}/uploads/${media}`}
                      alt="post"
                      className={styles.postMedia}
                    />
                  )}
                  <div className={styles.overlay}>
                    <FontAwesomeIcon
                      icon={faTrash}
                      className={styles.deleteIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post._id);
                      }}
                    />
                    <p>Likes: {post.likes?.length || 0}</p>
                    <p>Comments: {post.comments?.length || 0}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No posts found.</p>
          )}
        </div>
      )}

      {/* Selected Post Modal with Gallery */}
      {selectedPost && (
        <div className={styles.fullscreenOverlay} onClick={() => setSelectedPostId(null)}>
          <div className={styles.postDetail} onClick={(e) => e.stopPropagation()}>
            <div className={styles.postLeft}>
              <PostGallery post={selectedPost} />
            </div>
            <div className={styles.postRight}>
              <h3>Description</h3>
              <div style={{ marginLeft: "30.5rem", marginTop: "-1rem", fontSize: "13px" }}>❤️{selectedPost.likes?.length || 0} {selectedPost.likes?.length === 1 ? "Like" : "Likes"}</div>
              <p style={{ marginTop: "0.5rem" }}>{selectedPost.body || "No description provided"}</p>
              <hr style={{ marginTop: "1rem", marginBottom: "1rem", opacity: "0.5" }} />
              <h4>Comments</h4>
              <div style={{ marginTop: "0.5rem" }}>
                {selectedPost.comments?.length > 0 ? (
                  selectedPost.comments.map((comment, idx) => (
                    <div style={{ marginTop: "1rem" }} key={idx}>
                      <img src={comment.userId?.profilePicture ? `${BASE_URL}/uploads/${comment.userId.profilePicture}` : "/default.jpg"} alt="avatar"
                        style={{
                          width: "35px",
                          height: "35px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }} />
                      <h5 style={{ marginLeft: "2.4rem", marginTop: "-2.2rem", fontSize: "11px" }}>{comment.userId?.username}</h5>
                      <h6 style={{ marginLeft: "2.4rem", marginTop: "0.4rem", fontSize: "7.5px" }}>{getTimeAgo(comment.createdAt)}</h6>
                      <p style={{ marginTop: "1rem", marginLeft: "0.4rem", fontSize: "13px" }}>{comment.text}</p>
                      <div style={{ marginLeft: "30rem", fontSize: "13px" }}>❤️{comment.likes?.length || 0} {comment.likes?.length === 1 ? "Like" : "Likes"}</div>
                      <hr style={{ marginTop: "0.5rem", marginBottom: "0.5rem", opacity: "0.5" }} />
                    </div>
                  ))
                ) : (
                  <p>No comments yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
       {showNotification && (
        <div className={styles.notification}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p>{messages[messageIndex]}</p>
            <button className={styles.closeBtn}
              onClick={() => setShowNotification(false)}
              style={{ background: "none", border: "none", fontWeight: "bold", cursor: "pointer" }}
            >X</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Create;