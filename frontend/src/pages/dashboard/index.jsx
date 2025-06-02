import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import styles from "./dashboard.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getTimeAgo } from "../utile";
import {
  getAllPosts,
  createNewPost,
  likes,
  commentPost,
  getCommentsByPost,
  deleteComment,
  addReply,
  deleteReply
} from "../../config/redux/action/postAction";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faShareAlt,
  faComment,
  faFlag,
  faImage,
  faCalendarAlt,
  faPen,
  faPlus,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../config";
import axios from "axios";

const Dashboard = () => {
  
  const router = useRouter();
  const dispatch = useDispatch();
  //const { resumeId } = router.query;

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  //const [showCommentPanelForPost, setShowCommentPanelForPost] = useState(null);
  const [showCommentsMenu, setShowCommentsMenu] = useState(null);
  const [activeReply, setActiveReply] = useState(null); // stores commentId or replyId
  const [replyContent, setReplyContent] = useState('');
  const [showShareModal , setShowShareModal ] = useState(false);
  const [mediaIndexes, setMediaIndexes] = useState({});
  const [openReplies, setOpenReplies] = useState({});
  const posts = useSelector((state) => state.post.posts) || [];
  const user = useSelector((state) => state.auth.user) ;
  const userId = user?._id;
   const [news, setNews] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(new Date());

 
  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);
 
  
  useEffect(() => {
    setLoading(false); 
  }, [posts]);

  const handleMediaChange = (e) => {
  const files = Array.from(e.target.files);
  setMediaFiles(files);
  setMediaPreviews(files.map(file => URL.createObjectURL(file)));
};

 /* useEffect(() => {
    console.log("Arrayof posts:", posts);
  }, [posts]);*/
 
  /*likes* */
  const handleLike = (postId, type, commentId, replyId) => {
    const payload = { postId, type, userId, commentId, replyId };
    dispatch(likes(payload)).then(() => {
      dispatch(getAllPosts());
    });
  };
  
  /**get comment */
  useEffect(() => {
    if (showCommentsMenu && selectedPostId) {
      dispatch(getCommentsByPost(selectedPostId));
    }
  }, [showCommentsMenu,selectedPostId, dispatch]);

   /*comments* */

   const handleCommentDropdownToggle = (postId) => {
    if (showCommentsMenu === postId) {
      // If it's already open, close it
      setShowCommentsMenu(null);
      setSelectedPostId(null);
    } else {
      // Open the new one
      setShowCommentsMenu(postId);
      setSelectedPostId(postId);
      dispatch(getCommentsByPost(postId));
    }
  };
  
  const handleDelete = (postId, commentId) => {
    dispatch(deleteComment({ postId, commentId }))
      .then(() => {
        dispatch(getAllPosts());
        dispatch(getCommentsByPost(postId));
      });
  };
  
  // Handle submitting the comment
  const handleCommentSubmit = async () => {
    if (!commentContent) {
      alert('Please write a comment.');
      return;
    }

    const commentData = {
      postId: selectedPostId,
      text: commentContent,
    };

    try {
      await dispatch(commentPost(commentData));  
      setCommentContent(""); 
      await dispatch(getCommentsByPost(selectedPostId));
      await dispatch(getAllPosts());

    } catch (error) {
      console.error('Failed to submit comment', error);
    }
  }; 
  
  /*reply*/    
  const handleReplySubmit = (postId, comment) => {
    if (!user || !user._id) {
      console.warn("User is not logged in or userId is missing!");
      return;
    }
  
    if (!replyContent.trim()) {
      alert("Reply cannot be empty");
      return;
    }
  
    const commentOwnerId = comment?.userId;
  
    dispatch(addReply({
      postId,
      userId:user._id,
      commentId: comment._id,
      text: replyContent,
      replyToUserId: commentOwnerId,
    }))
      .then(() => {
        setReplyContent('');
        setActiveReply(null);
        dispatch(getAllPosts());
      })
      .catch((error) => {
        console.error("Error adding reply:", error);
      });
  };

    const handleDeleteReply = (postId, commentId, replyId) => {
    dispatch(deleteReply({ postId, commentId, replyId }))
      .then(() => {
        dispatch(getAllPosts());
        dispatch(getCommentsByPost(postId));
      });
  };
  
  /** post */
 const handleCreatePost = () => {
  if (!postContent || mediaFiles.length === 0) {
    alert("Please select at least one file and write a description.");
    return;
  }

  const formData = new FormData();
  formData.append("body", postContent);
  mediaFiles.forEach(file => formData.append("media", file));

  dispatch(createNewPost(formData))
    .unwrap()
    .then(() => {
      setPostContent("");
      setMediaFiles([]);
      setMediaPreviews([]);
      dispatch(getAllPosts());
    })
    .catch((err) => {
      console.error("Failed to create post", err);
    });
};
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

   useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get(
  `https://newsapi.org/v2/everything?q=education+OR+university+OR+school+OR+software+OR+IT+OR+technology+OR+company&sortBy=publishedAt&language=en&pageSize=5&apiKey=b4b2c4b010024230b8fc2b11fbf3696b`

                );
                setNews(response.data.articles);
                setLastUpdated(new Date());
            } catch (error) {
                console.error("Error fetching news:", error);
            }
        };

        fetchNews(); 

        const newsInterval = setInterval(fetchNews, 300000);

        const timeInterval = setInterval(() => setLastUpdated(new Date()), 1000);

        return () => {
            clearInterval(newsInterval);
            clearInterval(timeInterval);
        };
    }, []);

  //check user is login are not
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/Login");
    } else {
      setIsCheckingAuth(false); 
    }
  }, [router]);

  if (isCheckingAuth) return null;
  //tell here

  //right side news
  return (
    <>
    <div className={styles.dash}>
      {/* Create Post Section */}
      <div className={styles.middle}>
        <div className={styles.post}>
          <div className={styles.postBar}>
            <input
              type="text"
              placeholder="Add post..."
              className={styles.postInput}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)} />

            <div className={styles.actions}>
              <label className={styles.iconButton}>
                <FontAwesomeIcon icon={faPlus} />
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaChange}
                  className={styles.hiddenFileInput} />
              </label>
              <button className={styles.iconButton} onClick={handleCreatePost}>
                <FontAwesomeIcon icon={faArrowUp} />
              </button>
            </div>
          </div>

          {mediaPreviews.length > 0 && (
            <div className={styles.preview}>
              {mediaFiles.map((file, idx) =>
                file.type.startsWith("image") ? (
                  <img key={idx} src={mediaPreviews[idx]} alt="preview" className={styles.postImages} />
                ) : file.type.startsWith("video") ? (
                  <video key={idx} controls width="320" height="240" className={styles.postImages}>
                    <source src={mediaPreviews[idx]} type={file.type} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <p key={idx}>Preview not supported</p>
                )
              )}
            </div>
          )}

          <div className={styles.buttonContainer}>
            <button className={styles.b1}>
              <FontAwesomeIcon icon={faImage} style={{ marginRight: "4px" }} /> Media
            </button>
            <button className={styles.b2}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: "4px" }} /> Events
            </button>
            <button className={styles.b3} onClick={() => router.push("/Resume")}>
              <FontAwesomeIcon icon={faPen} style={{ marginRight: "4px" }} /> Write article
            </button>
          </div>
        </div>
      </div>

      {/* Posts Feed Section */}
    <div className={styles.posts}>
      {loading ? (
        <p style={{ textAlign: "center", marginTop: "1rem" }}>Loading posts...</p>
      ) : posts.length > 0 ? (
        posts.map((post, index) => {
          const currentIdx = mediaIndexes[post._id] || 0;
          const mediaCount = post.media.length;

          const handlePrev = () => {
            setMediaIndexes(prev => ({
              ...prev,
              [post._id]: (currentIdx - 1 + mediaCount) % mediaCount
            }));
          };

          const handleNext = () => {
            setMediaIndexes(prev => ({
              ...prev,
              [post._id]: (currentIdx + 1) % mediaCount
            }));
          };

          return (
            <div key={post._id || `post-${index}`} className={styles.postItem}>
              <div className={styles.postHeader}>
                <div className={styles.userInfo}>
                  <img
                    src={
                      post?.userId?.profilePicture
                        ? `${BASE_URL}/uploads/${post?.userId?.profilePicture}`
                        : "/default.jpg"
                    }
                    alt="Avatar"
                    className={styles.avatar}
                  />
                  <p className={styles.username}>{post.userId?.username}</p>
                  <span className={styles.date}>{getTimeAgo(post.createdAt)}</span>
                </div>

                <div className={styles.postContent}>
                  <p>{post.body}</p>
                </div>

            <hr style={{ marginBottom: "0.5rem", marginTop: "0.5rem" }} />

            {Array.isArray(post.media) && post.media.length > 0 && (
              <div className={styles.postMedia} style={{ position: "relative" }}>
                {/* Left Arrow */}
                {mediaCount > 1 && (
                  <button className={styles.arrowLeft}
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
                      cursor: "pointer"}}>&#8592;
                  </button>
                )}

                {/* Show only the current media */}
                {post.fileType[currentIdx] && post.fileType[currentIdx].startsWith("image") ? (
                  <img
                    src={`${BASE_URL}/uploads/${post.media[currentIdx]}`}
                    alt="post"
                    className={styles.postImages}
                  />
                ) : post.fileType[currentIdx] && post.fileType[currentIdx].startsWith("video") ? (
                  <video
                    controls
                    width="320"
                    height="240"
                    className={styles.postImages}
                  >
                    <source src={`${BASE_URL}/uploads/${post.media[currentIdx]}`} type={post.fileType[currentIdx]} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <p>Unsupported file type: {post.fileType[currentIdx]}</p>
                )}

                {/* Right Arrow */}
                {mediaCount > 1 && (
                  <button className={styles.arrowRight}
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
                    }}> &#8594;
                  </button>
                )}
              </div>
            )}
            </div>

              {/* Dots for media navigation */}
              <div className={styles.mediaDots}>
              {post.media.map((_, idx) => (
                <span key={idx} className={`${styles.dot} ${currentIdx === idx ? styles.activeDot : ""}`}
                  onClick={() => setMediaIndexes(prev => ({
                    ...prev,
                    [post._id]: idx
                  }))}>●</span>
              ))}
            </div>

              <div style={{ display:"flex",justifyContent:"space-between",alignContent:'flex-start', marginTop: "14px", fontWeight: "300", fontSize: "13px" }}>
                {Array.isArray(post.likes) ? post.likes.length : 0} Likes
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  {Array.isArray(post.likes) && post.likes.length > 0 && (
                    <>
                      {post.likes.map((user, index) => (
                        <span key={user._id || `like-${index}`}>{user.username}{index < post.likes.length - 1 && ", "}
                        </span>
                      ))}
                    </>
                  )}
                </div>
                <div>
                  <button className={styles.commentMenu} onClick={() => handleCommentDropdownToggle(post._id)}>
                  {Array.isArray(post.comments) ? post.comments.length : 0} Comments
                  </button>
                </div>
              </div>
              {showCommentsMenu === post._id && (
                    <div className={styles.rightMenu}>
                      <button className={styles.closeButton} onClick={() => {setShowCommentsMenu(null); setSelectedPostId(null)}}>X</button>
                      <h2>Comments</h2>
                      <div className={styles.commentSection}>
                        {post.comments && post.comments.length > 0 ? ( 
                          post.comments.map((comment, cIndex) => (
                          <div key={comment._id || `comment-${cIndex}`} className={styles.commentItem}>
                            <div className={styles.commentHeader}>
                              <img
                                 src={
                                  comment.userId.profilePicture
                                    ? `${BASE_URL}/uploads/${comment.userId.profilePicture}`
                                    : "/default.jpg"}
                                alt="avatar" className={styles.avatar3}/>
                              <div className={styles.commentText}>
                                <h3>{comment.userId.name}</h3>
                                <span className={styles.commentTime}>
                                <small>{getTimeAgo(comment.createdAt)}</small>
                                </span>
                              </div>
                               <button
                                      className={styles.downArrowBtn}
                                      onClick={() =>
                                        setOpenReplies((prev) => ({
                                          ...prev,
                                          [comment._id]: !prev[comment._id],
                                        }))
                                      }
                                      aria-label="Show replies" >
                                      {openReplies[comment._id] ? "▲" : "▼"}
                                    </button>
                            </div>
                            <p className={styles.commentText}>{comment.text}</p>
                            <div className={styles.commentActions}>
                              <button onClick={() => handleLike(post._id, "comment",  comment._id,)}>{comment.likes?.length || 0} Like</button>
                              <button onClick={() => setActiveReply(comment._id)}>Reply</button>
                              <button onClick={() =>handleDelete(post._id, comment._id )}>Delete </button> 
                            </div>

                            <hr style={{marginTop:"0.9rem"}}/>
                           {/* Displaying replies for each comment */}
                          {openReplies[comment._id] && comment.replies && comment.replies.length > 0 && (
                            <div className={styles.repliesSection}>
                              <h4 style={{marginLeft:"1rem", marginTop:"1rem", fontSize:"12px"}}>Replies</h4>
                              {comment.replies.map((reply, rIndex) => (
                                <div key={reply._id || `reply-${rIndex}`} className={styles.replyItem}>
                                  <div className={styles.replyHeader}>
                                    <img src={
                                        reply.userId?.profilePicture
                                          ? `${BASE_URL}/uploads/${reply.userId?.profilePicture}`
                                          : "/default.jpg"
                                      }
                                      alt="avatar"
                                      className={styles.avatar3} />
                                    <div className={styles.commentText}>
                                      <h3>{reply.userId?.username}</h3>
                                      <span className={styles.commentTime}>
                                        <small>{getTimeAgo(reply.createdAt)}</small>
                                      </span>
                                    </div>
                                  </div>
                                  <p className={styles.commentText}>{reply.text}</p>
                                   {/* Add reply actions here */}
                                    <div className={styles.replycommentActions}>
                                      <button className={styles.replyButton} onClick={() => handleLike(post._id, "reply", comment._id, reply._id)}>
                                        {reply.likes?.length || 0} Like
                                      </button>
                                      <button className={styles.replyButton} onClick={() => setActiveReply(reply._id)}>
                                        Reply
                                      </button>
                                      <button className={styles.replyButton} onClick={() => handleDeleteReply(post._id, comment._id, reply._id)}>
                                        Delete
                                      </button>
                                    </div>
                                     {activeReply === reply._id && (
                                      <div className={styles.replyBox}>
                                        <textarea
                                          placeholder="Write a reply..."
                                          value={replyContent}
                                          onChange={(e) => setReplyContent(e.target.value)}
                                          className={styles.commentInput}
                                        />
                                        <button
                                          onClick={() => handleReplySubmit(post._id, comment)}
                                          className={styles.commentBtn}
                                        >
                                          <FontAwesomeIcon icon={faArrowUp} />
                                        </button>
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          )}
                  
                        {/* Active reply box */}
                        {activeReply === comment._id && (
                          <div className={styles.replyBox}>
                            <textarea
                              placeholder="Write a reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className={styles.commentInput}
                            />
                            <button
                              onClick={() => handleReplySubmit(post._id, comment)}
                              className={styles.commentBtn}
                            >
                              <FontAwesomeIcon icon={faArrowUp} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                      ):(
                        <p style={{color:"black", fontFamily:"Plus Jakarta Sans', sans-serif"}}>No comments yet. Be the first to add one!</p>
                      )}
                    </div>
                  </div>
                  )}
              <hr style={{ marginBottom: "0.5rem", marginTop: "0.9rem" }} />
              <div className={styles.postActions}>
                <button className={styles.actionBtn} onClick={() => handleLike(post._id, "post")}>
                  <span className={styles.iconWithText}>
                    <FontAwesomeIcon icon={faThumbsUp} />
                    Like
                  </span>
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.iconWithText} onClick={() => {setShowShareModal (true)}}>
                    <FontAwesomeIcon icon={faShareAlt} />
                    Share
                  </span>
                </button>
                <button className={styles.actionBtn} onClick={() => {handleCommentDropdownToggle(post._id)}}>
                  <span className={styles.iconWithText}>
                    <FontAwesomeIcon icon={faComment} />
                    Comment
                  </span>
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.iconWithText}>
                    <FontAwesomeIcon icon={faFlag} />
                    Report
                  </span>
                </button>
              </div>
              { selectedPostId === post._id && (
              <div className={styles.commentDropdown}>
                <textarea
                  className={styles.commentInput}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                />
                <button onClick={handleCommentSubmit} className={styles.commentBtn}>
                  Comment
                </button>
              </div>
            )}
            </div>
          );
        })
        ) : (
          <p style={{ textAlign: "center" }}>No posts yet.</p>
        )}
        </div>
        {showShareModal && (

        <div className={styles.shareModal}>
          <h5 style={{marginLeft:"-11.3rem", marginBottom:"10px"}}>Share to...</h5>
          <hr style={{opacity:"0.5", marginBottom:"10px"}}/>
            <button className={styles.crossShare} onClick={() => setShowShareModal(false)}>✖</button>
          <div className={styles.shareOptions}>
            {/* WhatsApp */}
            <button
              onClick={() => {
                const msg = encodeURIComponent("Hey! Check this out: https://your-link.com");
                window.open(`https://wa.me/?text=${msg}`, "_blank");
              }}
            >
              <h4>WhatsApp</h4>
            </button>

            {/* Facebook */}
            <button
              onClick={() => {
                const fbUrl = encodeURIComponent("https://your-link.com");
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${fbUrl}`, "_blank");
              }}
            >
              <h4>Facebook</h4>
            </button>

            {/* Twitter */}
            <button
              onClick={() => {
                const tweet = encodeURIComponent("Hey! Check this out: https://your-link.com");
                window.open(`https://twitter.com/intent/tweet?text=${tweet}`, "_blank");
              }}
            >
              <h4>Twitter</h4>
            </button>
          </div>
          </div>
      )}
      <div className={styles.last}>
        <div className={styles.rightSide}>
                  <p className={styles.heading}>Linkedin News</p>
                  <hr style={{marginTop:"0.4rem",marginBottom:"0.5rem", opacity:"0.7"}}/>
                  <ul className={styles.newsList}>
                      {news.map((item, index) => (
                          <li key={index} className={styles.newsItem}>
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                  {item.title}
                              </a>
                          </li>
                      ))}
                  </ul>
          </div>
        </div>
        <div className={styles.jobSort} onClick={() => router.push("/JobsSort")}>
          <p>Jobs near you</p>
        </div>
      </div>
      </>
  );
};

export default Dashboard;
