import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import styles from "./userProfile.module.css";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { getAllPosts } from '@/config/redux/action/postAction';
import { connectionRequest, handleConnectionRequest, getMyConnectionsRequest } from '../../config/redux/action/authAction';
import { BASE_URL } from '@/config';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faExpand, faCompress, faTrash } from '@fortawesome/free-solid-svg-icons';
import { sendMessage, getMessages, deleteAllMessages, deleteMessage } from '@/config/redux/action/messageAction';
import Download from "../download/index.jsx";

// --- PostGallery component for modal ---
function PostGallery({ post }) {
  if (!post) return null;
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
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            background: "rgba(255,255,255,0.7)",
            border: "none",
            fontSize: "2rem",
            cursor: "pointer"
          }}
        >&#8592;</button>
      )}

      {fileTypeArr[currentIdx] && fileTypeArr[currentIdx].startsWith("video") ? (
        <video controls width="100%" className={styles.postMedia}>
          <source src={`${BASE_URL}/uploads/${mediaArr[currentIdx]}`} type={fileTypeArr[currentIdx]} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={`${BASE_URL}/uploads/${mediaArr[currentIdx]}`}
          alt="Post"
          className={styles.postMedia}
          style={{ maxHeight: "400px", objectFit: "contain" }}
        />
      )}

      {mediaArr.length > 1 && (
        <button
          onClick={handleNext}
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            background: "rgba(255,255,255,0.7)",
            border: "none",
            fontSize: "2rem",
            cursor: "pointer"
          }}
        >&#8594;</button>
      )}

      {mediaArr.length > 1 && (
        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
          {mediaArr.map((_, idx) => (
            <span
              key={idx}
              style={{
                cursor: "pointer",
                fontSize: "1.2rem",
                color: currentIdx === idx ? "#0073b1" : "#bbb",
                margin: "0 2px"
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIdx(idx);
              }}
            >●</span>
          ))}
        </div>
      )}
    </div>
  );
}

const UserProfile = ({ profile, notFound }) => {
  if (notFound || !profile) {
    return <h2 className={styles.container}>No user found</h2>;
  }

  const router = useRouter();
  const user = profile.userId;
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.post);

  const [userPosts, setUserPosts] = useState([]);
  const [connectMessage, setConnectMessage] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const [Connect, setConnect] = useState(false); 
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user'));
      setCurrentUserId(user?._id);
    }
  }, []);

  const getUsersPost = async () => {
    await dispatch(getAllPosts());
  };

  useEffect(() => {
    getUsersPost();
  }, [dispatch]);

  useEffect(() => {
    if (posts.posts && profile?.userId?._id) {
      const filtered = posts.posts.filter(
        post => post.userId?._id === profile.userId._id
      );
      setUserPosts(filtered);
    }
  }, [posts, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //connection request
  const { acceptedConnections = [] } = useSelector((state) => state.auth);

  const isConnected = acceptedConnections.some((connection) => {
    const myId = currentUserId; 
    const otherUserId = profile.userId._id; 

    return (
      (connection.userId._id === myId && connection.connectionId._id === otherUserId) ||
      (connection.userId._id === otherUserId && connection.connectionId._id === myId)
    );
  });

  //reset connection
  const handleReset = async () => {
    const confirmReset = window.confirm("Do want to disconnect?");
    if(confirmReset){
      try {
        await dispatch(handleConnectionRequest({ connectionId: user._id, action: "reset" }));
        dispatch(getMyConnectionsRequest());
      } catch (err) {
        console.error(err);
      }
    }
  };
  const handleConnect = async () => {
    const targetUserId = user._id;

    if (!currentUserId || !targetUserId) {
      setConnectMessage("User information is missing");
      return;
    }

    try {
      const resultAction = await dispatch(
        connectionRequest({
          userId: currentUserId,
          connectionId: targetUserId,
        })
      );
      if (connectionRequest.fulfilled.match(resultAction)) {
        setConnectMessage("Connection request sent successfully!");
        setConnect(true);
        dispatch(getMyConnectionsRequest());
      } else {
        setConnectMessage(resultAction.payload?.message || "Failed to send request.");
      }
    } catch (error) {
      console.error("Error while sending connection request:", error);
      setConnectMessage("An unexpected error occurred.");
    }

    setTimeout(() => setConnectMessage(""), 5000);
  };

  //message box toggle
  const toggleMessageBox = async () => {
    setShowMessageBox(!showMessageBox);

    if (!showMessageBox) {
      try {
        const fetchedMessages = await dispatch(getMessages(user._id)).unwrap();
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        alert("Failed to fetch messages.");
      }
    }
  };

  //send message 
  const handleSend = async () => {
    if (!messageText.trim()) {
      alert("Please enter a message.");
      return;
    }

    try {
      const result = await dispatch(
        sendMessage({
          receiverId: user._id,
          message: messageText,
        })
      ).unwrap();

      setMessages((prevMessages) => [
        ...prevMessages,
        { ...result, senderId: currentUserId }
      ]);
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  //delete all messages 
  const handleDeleteAllMessages = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete all messages?");
    if (!confirmDelete) return;

    try {
      await dispatch(deleteAllMessages()).unwrap();
      setMessages([]);
      alert("All messages have been deleted.");
    } catch (error) {
      console.error("Error deleting all messages:", error);
      alert("Failed to delete messages.");
    }
  };

  //delete message
  const handleDeleteMessage = async (messageId) => {
    const confirmDelete = window.confirm("Delete this message?");
    if (!confirmDelete) return;

    try {
      await dispatch(deleteMessage(messageId)).unwrap();
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Could not delete message.");
    }
  };

  //message box size toggle
  const toggleBoxSize = () => {
    setIsExpanded((prev) => !prev);
  };

  const formatMessageDate = (messageDate, previousDate = null) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay =
      previousDate &&
      new Date(messageDate).toDateString() === new Date(previousDate).toDateString();

    let label = null;

    if (!isSameDay) {
      if (new Date(messageDate).toDateString() === today.toDateString()) {
        label = "Today";
      } else if (new Date(messageDate).toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else {
        label = new Date(messageDate).toLocaleDateString();
      }
    }

    const time = new Date(messageDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { label, time };
  };

  const Message = ({ message, onDelete, currentUserId }) => {
    const [showDelete, setShowDelete] = useState(false);
    const timerRef = useRef(null);

    const handleMouseDown = () => {
      timerRef.current = setTimeout(() => {
        setShowDelete(true);
      }, 600);
    };

    const handleMouseUp = () => {
      clearTimeout(timerRef.current);
    };

    return (
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className={message.senderId === currentUserId ? styles.messageRight : styles.messageLeft}
        style={{ position: "relative" }}
      >
        <p>{message.message}</p>

        {showDelete && (
          <FontAwesomeIcon
            icon={faTrash}
            onClick={() => onDelete(message._id)}
            style={{
              position: 'absolute',
              top: '5px',
              left: '11rem',
              color: 'red',
              cursor: 'pointer',
              color:"black",
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
    <div className={styles.container}>
      <Download userId={user._id}/>
      <div
        className={styles.backgroundImage}
        style={{
          backgroundImage: `url(${user?.backgroundImage ? `${BASE_URL}/uploads/${user.backgroundImage}` : "/backgroundAdi.jpeg"})`,
        }}
      ></div>

      <div className={styles.avatarWrapper3}>
        <img
          className={styles.UserProfilePic}
          key={user?.profilePicture}
          src={user?.profilePicture ? `${BASE_URL}/uploads/${user.profilePicture}` : "/default.jpg"}
        />
      </div>
      <div className={styles.info}>
        <h3>About:</h3>
        {profile.bio ? (
          showFullProfile ? (
            <>
              {profile.bio.split('\n').map((para, idx) => (
                <p key={idx} style={{ marginTop: "1rem" }}>{para}</p>
              ))}

              <div className={styles.section}>
                <h3>Current Position:</h3>
                <p>{profile.currentPosition || "Not provided"}</p>
              </div>

              <div className={styles.section}>
                <h3>Past Work:</h3>
                {profile.pastWork.length ? (
                  profile.pastWork.map((job) => (
                    <p key={job._id}>
                      {job.position} at {job.company} ({job.years} year{job.years > 1 ? 's' : ''})
                    </p>
                  ))
                ) : (
                  <p>No work experience</p>
                )}
              </div>

              <div className={styles.section}>
                <h3>Education:</h3>
                {profile.education.length ? (
                  profile.education.map((edu) => (
                    <p key={edu._id}>
                      {edu.degree} in {edu.fieldOfStudy} from {edu.school} ({edu.years.start} - {edu.years.end})
                    </p>
                  ))
                ) : (
                  <p>No education data</p>
                )}
              </div>

              <button
                style={{
                  marginTop: "1rem",
                  color: "#0073b1",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "14px"
                }}
                onClick={() => setShowFullProfile(false)}
              >Show Less</button>
            </>
          ) : (
            <>
              <p style={{ marginTop: "1rem" }}>{profile.bio.split('\n')[0]}</p>
              <button
                style={{
                  marginTop: "1.5rem",
                  color: "#0073b1",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "14px"
                }}
                onClick={() => setShowFullProfile(true)}
              >Read More</button>
            </>
          )
        ) : (
          <p>Not provided</p>
        )}
      </div>
      {isConnected ? (
        <button onClick={handleReset} className={styles.connectedBtn}>Connected</button>
      ) : (
        <button onClick={handleConnect} className={styles.connectBtn}>Connect</button>
      )}

      {connectMessage && <div className={styles.connectionPrompt}>{connectMessage}</div>}
      <button className={styles.MessageBtn} onClick={toggleMessageBox}> Message </button>

      <div className={styles.messageWrapper}>
        {showMessageBox && (
          <div className={`${styles.messageBox} ${isExpanded ? styles.expanded : styles.collapsed}`} >
            <div className={styles.chatContainer}>
              <div className={styles.Messavatar}>
                <img className={styles.UserProfilePic} key={user?.profilePicture} src={user?.profilePicture ? `${BASE_URL}/uploads/${user.profilePicture}` : "/default.jpg"}/>
              </div>
              <p style={{marginTop:"-1.7rem", marginLeft:"-10rem", fontSize:"13px"}}>{user.username}</p>
              <div className={styles.messageHeaderButtons}>
                <button title="delete All Messages"className={styles.deleteBtn} onClick={handleDeleteAllMessages}><FontAwesomeIcon icon={faTrash}/></button>
                <button className={styles.togglBtn} onClick={toggleBoxSize}><FontAwesomeIcon icon={isExpanded ? faCompress : faExpand} /></button>
                <button title="close message box" className={styles.Messcross} onClick={toggleMessageBox}>X</button>
              </div>

              <hr style={{marginTop:"1rem", marginBottom:"1rem", opacity:"0.4"}}/>
              {messages.length > 0 ? (
                messages.map((message, index) => {
                  const messageDate = message.createdAt;
                  const previousDate = index > 0 ? messages[index - 1].createdAt : null;

                  const { label, time } = formatMessageDate(messageDate, previousDate);

                  return (
                    <React.Fragment key={index}>
                      {label && (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#666",
                            fontSize: "12px",
                            margin: "10px 0",
                          }}
                        >
                          {label}
                        </div>
                      )}
                      <div
                        className={
                          message.senderId === currentUserId
                            ? styles.messageRight
                            : styles.messageLeft
                        }
                      >
                        <Message
                          message={message}
                          onDelete={handleDeleteMessage}
                          currentUserId={currentUserId}
                        />
                        <span className={styles.time}>{time}</span>
                      </div>
                    </React.Fragment>
                  );
                })
              ) : (
                <p>No messages yet.</p>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className={styles.messageArea}>
              <textarea
                className={styles.messageInput}
                rows="2"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button className={styles.sendButton} onClick={handleSend} aria-label="Send">
                <FontAwesomeIcon icon={faArrowUp} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        {userPosts.length > 0 ? (
          <>
            <h3>Posts:</h3>
            <div className={styles.postsContainer}>
              {userPosts.map((post) => {
                const fileType = Array.isArray(post.fileType) ? post.fileType[0] : post.fileType;
                return (
                  <div
                    key={post._id}
                    className={styles.postCard}
                    onClick={() => setSelectedPost(post)}
                    style={{ cursor: "pointer" }}
                  >
                    {fileType && fileType.startsWith("video") ? (
                      <video
                        src={`${BASE_URL}/uploads/${post.media}`}
                        className={styles.postMedia}
                        style={{ width: "100%", height: "auto" }}
                        controls
                      />
                    ) : (
                      <img
                        src={`${BASE_URL}/uploads/${post.media}`}
                        alt="post"
                        className={styles.postMedia}
                      />
                    )}
                    <div className={styles.userPostOverlay}>
                      <span>❤️ {post.likes?.length || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <h3>{user?.name}'s Posts: <span>No posts yet.</span></h3>
        )}
      </div>

      {/* --- Selected Post Modal --- */}
      {selectedPost && (
        <div className={styles.fullscreenOverlay} onClick={() => setSelectedPost(null)}>
          <div className={styles.postDetail} onClick={e => e.stopPropagation()}>
            <div className={styles.postLeft}>
              <PostGallery post={selectedPost} />
            </div>
            <div className={styles.postRight}>
              <h3>Description</h3>
              <div style={{ fontSize: "13px" }}>
                ❤️{selectedPost.likes?.length || 0} {selectedPost.likes?.length === 1 ? "Like" : "Likes"}
              </div>
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
                      <p style={{ marginTop: "1rem", marginLeft: "0.4rem", fontSize: "13px" }}>{comment.text}</p>
                      <div style={{ fontSize: "13px" }}>❤️{comment.likes?.length || 0} {comment.likes?.length === 1 ? "Like" : "Likes"}</div>
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

    </div>
    </>
  );
};

export async function getServerSideProps(context) {
  const { username } = context.params;

  try {
    const res = await axios.get(`http://localhost:9000/getUserBySearch?username=${username}`);
    return {
      props: {
        profile: res.data.profile,
      },
    };
  } catch (err) {
    console.error("SSR fetch failed:", err.message);
    return {
      props: {
        notFound: true,
      },
    };
  }
}

export default UserProfile;