import React, { useRef, useEffect, useState } from 'react';
import styles from "./AI.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileImport, faTrash, faCheck, faCopy, faPlus, faMicrophone, faPaperPlane, faPenToSquare, faBars, faXmark, faLanguage
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { getTimestamp } from '../utile';

function AI() {
  const router = useRouter();
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [uploadedFilePath, setUploadedFilePath] = useState('');
  const [uploadedFilePreview, setUploadedFilePreview] = useState('');
  const [language, setLanguage] = useState('en');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const groupedChats = groupChatsByDate(chatList);
  const [copiedChatId, setCopiedChatId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Unified file input logic
  const [pendingFile, setPendingFile] = useState(null);
  const [uploadType, setUploadType] = useState(null); // 'ai-image' or 'resume'
  const [jobsData, setJobsData] = useState(null);

  function groupChatsByDate(chats) {
    const grouped = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    chats.forEach(chat => {
      const date = getTimestamp(chat) || new Date();
      const chatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      let label = chatDate.toLocaleDateString();

      if (chatDate.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
        label = 'Today';
      } else if (chatDate.getTime() === new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime()) {
        label = 'Yesterday';
      } else {
        label = chatDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(chat);
    });

    return grouped;
  }
  const sortedDateLabels = Object.keys(groupedChats).sort((a, b) => {
    const labelToDate = (label) => {
      if (label === 'Today') return new Date();
      if (label === 'Yesterday') {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
      }
      return new Date(label);
    };
    return labelToDate(b) - labelToDate(a);
  });

  // Generate sessionId
  useEffect(() => {
    async function getSessionId() {
      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        try {
          const res = await fetch("https://linkedin-clone-1lln.onrender.com/start-chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            }
          });
          const data = await res.json();
          sessionId = data.sessionId;
          localStorage.setItem("sessionId", sessionId);
        } catch (err) {
          console.error("Failed to start chat session", err);
        }
      }
      setSessionId(sessionId);
    }
    getSessionId();
  }, []);

  // Close the dropdown if clicked outside
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleIconClick = () => {
    setIsDropdownOpen(prev => !prev); // Toggle dropdown visibility
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    const resizeTextarea = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };
    textarea.addEventListener('input', resizeTextarea);
    return () => textarea.removeEventListener('input', resizeTextarea);
  }, []);

  // Unified send handler for both AI and Resume
  const handleSend = async () => {
    setLoading(true);
    let imagePathToSend = uploadedFilePath;

    // If user selected a file for AI image or Resume
    if (pendingFile && uploadType) {
      const formData = new FormData();
      let endpoint = "";

      if (uploadType === "ai-image") {
        formData.append('AI_images', pendingFile);
        endpoint = "https://linkedin-clone-1lln.onrender.com/AIimages";
      } else if (uploadType === "resume") {
        formData.append('file', pendingFile);
        endpoint = "https://linkedin-clone-1lln.onrender.com/jobs/scan-resume";
      }

      try {
        const res = await fetch(endpoint, { method: 'POST', body: formData });
        const data = await res.json();
        if (uploadType === "ai-image") {
          setUploadedFilePath(data.filename);
          setUploadedFilePreview(URL.createObjectURL(pendingFile));
          imagePathToSend = data.filename;
        } else if (uploadType === "resume") {
          setJobsData(data); // Only show jobs/skills after send
        }
      } catch (err) {
        console.error('Upload Error:', err);
        setLoading(false);
        return;
      } 
      //return;
    }

    // ...existing chat send logic (text/microphone)...
    if (!message.trim() && !uploadedFilePath) {
      setLoading(false);
      return;
    }

    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      alert("User not found. Please login.");
      setLoading(false);
      return;
    }

    const userMessage = message;
    const dataToSend = { message, imagePath: imagePathToSend, language, sessionId };
    try {
      const res = await fetch('https://linkedin-clone-1lln.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const data = await res.json();
      let translatedReply = data.reply;
       let extractedText = data.extractedText;
      const newChat = { question: userMessage, answer: translatedReply, imagePath: imagePathToSend, extractedText };

      setChatList(prev => { return [newChat, ...prev] });
      setCurrentChat(newChat);
    } catch (error) {
      console.error("Error sending message:", error);
      setReply("Error: couldn't reach AI.");
    } finally {
      setLoading(false);
      setMessage('');
      setUploadedFilePath('');
      setUploadedFilePreview('');
      setPendingFile(null);
      setUploadType(null);
    }
  };

  function formatReply(text) {
    if (!text || typeof text !== 'string') return <p>No reply yet.</p>;

    const lines = text.split('\n');
    const elements = [];
    let currentList = null;
    let listKey = 0;

    lines.forEach((line, index) => {
      if (line.startsWith('###')) {
        if (currentList) {
          elements.push(<ul key={`list-${listKey++}`}>{currentList}</ul>);
          currentList = null;
        }
        elements.push(<h3 key={`h3-${index}`}>{line.replace(/^###\s*/, '')}</h3>);
      } else if (line.startsWith('- ')) {
        if (!currentList) currentList = [];
        currentList.push(<li key={`li-${index}`}>{line.slice(2)}</li>);
      } else if (line.trim() !== '') {
        if (currentList) {
          elements.push(<ul key={`list-${listKey++}`}>{currentList}</ul>);
          currentList = null;
        }
        elements.push(<p key={`p-${index}`}>{line}</p>);
      }
    });

    // Add remaining list if text ends with a list
    if (currentList) {
      elements.push(<ul key={`list-${listKey++}`}>{currentList}</ul>);
    }

    return elements;
  }

  //history
  useEffect(() => {
    async function getSessionIdAndHistory() {
      let sessionId = localStorage.getItem("sessionId");

      if (!sessionId) {
        try {
          const res = await fetch("https://linkedin-clone-1lln.onrender.com/start-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();
          sessionId = data.sessionId;
          localStorage.setItem("sessionId", sessionId);
        } catch (err) {
          console.error("Failed to start chat session", err);
          return;
        }
      }

      try {
        const historyRes = await fetch(`https://linkedin-clone-1lln.onrender.com/history/${sessionId}`);
        const contentType = historyRes.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const rawText = await historyRes.text();
          console.error("Expected JSON but got:", rawText);
          throw new Error("Server did not return JSON");
        }

        const historyData = await historyRes.json();
        const formattedChats = [];

        for (let i = 0; i < historyData.length; i++) {
          if (
            historyData[i].role === "user" &&
            i + 1 < historyData.length &&
            historyData[i + 1].role === "assistant"
          ) {
            formattedChats.push({
              question: historyData[i].content,
              answer: historyData[i + 1].content,
              imagePath: historyData[i].imagePath || "",
               extractedText: historyData[i].extractedText || "",
              timeStamp: historyData[i].timeStamp || historyData[i].createdAt || new Date(),
              messageId: historyData[i]._id,
              responseId: historyData[i + 1]._id
            });
            i++;
          }
        }

        setChatList(formattedChats);
      } catch (err) {
        console.error("Failed to fetch or parse chat history", err);
      }
    }

    getSessionIdAndHistory();
  }, []);

  //microphone//
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = language || "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      setMessage(transcript);
      setTimeout(() => handleSend(), 300);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      recognitionRef.current.errorHandled = true;

      if (event.error === "no-speech") {
        alert("No speech detected. Please try again and speak clearly.");
      } else {
        alert("Microphone error: " + event.error);
      }
    };
    recognition.onend = () => {
      setIsListening(false);
      if (message.trim() === "" && !recognitionRef.current.errorHandled) {
        alert("No speech detected. Please try again and speak clearly.");
      }
    };

    recognitionRef.current = recognition;
  }, [language]);

  // File input ref
  const fileInputRef = useRef(null);

  const handleDeleteMessage = async (sessionId, messageId) => {
  try {
    const res = await fetch(`https://linkedin-clone-1lln.onrender.com/chat/${sessionId}/message/${messageId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Failed to delete message:', err.error);
      return;
    }

    // After successful deletion, remove from chat list (state)
    setChatList(prevList =>
      prevList.filter(chat =>
        chat.messageId !== messageId &&
        chat.responseId !== messageId
      )
    );

    // Also clear currentChat if it's the one deleted
    if (
      currentChat?.messageId === messageId ||
      currentChat?.responseId === messageId
    ) {
      setCurrentChat(null);
    }
  } catch (error) {
    console.error('Error deleting message:', error);
  }
};

  return (
    <>
      <div className={styles.AIContainer}>
        {showMenu && (
          <div className={styles.AIHistroy}>
            <div className={styles.AIHISheading}>
              <h4>Histroy</h4>
              <FontAwesomeIcon icon={faXmark} onClick={() => setShowMenu(false)} className={styles.closeIcon} />
            </div>
            <hr style={{ marginTop: "1rem", opacity: "0.3" }} />
            {/* History sidebar */}
            <div className={styles.historyList}>
              {chatList.length > 0 ? (
                sortedDateLabels.map(dateLabel => (
                  <div key={dateLabel}>
                    <h4>{dateLabel}</h4>
                    {groupedChats[dateLabel].map((chat, idx) => (
                      <p key={idx} onClick={() => setCurrentChat(chat)} style={{ cursor: "pointer" }}>
                        {chat.question.slice(0, 30)}.</p>
                    ))}
                    <hr style={{ marginTop: "1rem", marginBottom: "0.5rem", opacity: "0.3" }} />
                  </div>
                ))
              ) : (
                <p>No history yet.</p>
              )}
            </div>
          </div>
        )}
        <div className={styles.AIside}>
          <FontAwesomeIcon icon={faBars} onClick={() => setShowMenu(true)} title="History" />
          <FontAwesomeIcon icon={faPenToSquare} style={{ marginLeft: "2rem" }} onClick={() => { setMessage(""); setShowMenu(false); setCurrentChat(null); textareaRef.current?.focus(); }} title='new chat' />
        </div>

        <div className={styles.inputWrapper}>
          {uploadedFilePreview && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <img src={uploadedFilePreview} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
              <button onClick={() => { setPendingFile(null); setUploadType(null); setUploadedFilePreview(''); }}>X</button>
            </div>
          )}

          <textarea
            className={styles.AIinput}
            ref={textareaRef}
            placeholder="Ask anything"
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className={styles.controls}>
            <input
              type="file"
              accept={uploadType === "resume" ? ".pdf,.doc,.docx,image/*" : "image/*,.pdf"}
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                setPendingFile(file);
                setUploadedFilePreview(URL.createObjectURL(file));
              }}
            />
            {/* Plus icon for images */}
            <button
              className={styles.circleButton}
              onClick={() => {
                setUploadType("ai-image");
                fileInputRef.current.click();
              }}>
              <FontAwesomeIcon icon={faPlus} title='Add images' />
            </button>
            {/* Scan icon for resume */}
            <button
              className={styles.circleButton}
              onClick={() => {
                setUploadType("resume");
                fileInputRef.current.click();
              }}>
              <FontAwesomeIcon title="Scan Resume" icon={faFileImport} />
            </button>
            {/* Microphone */}
            <button className={styles.circleButton}
              onClick={() => {
                if (recognitionRef.current) {
                  if (isListening) {
                    recognitionRef.current.stop();
                  } else {
                    recognitionRef.current.errorHandled = false;
                    recognitionRef.current.start();
                  }
                }
              }}>
              <FontAwesomeIcon icon={faMicrophone} title='Microphone' />
            </button>
            <div className={styles.dropdownWrapper} ref={dropdownRef}>
              <button className={styles.circleButton} onClick={handleIconClick}>
                <FontAwesomeIcon icon={faLanguage} title='Translate' />
              </button>
              {isDropdownOpen && (
                <select
                  className={styles.languageDropdown}
                  value={language}
                  onChange={(e) => { setLanguage(e.target.value); setIsDropdownOpen(false); }}
                  title="Translate Reply To"
                >
                  <option value="te">Telugu</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              )}
            </div>
            <button className={styles.sendButton} onClick={handleSend}><FontAwesomeIcon icon={faPaperPlane} /></button>
          </div>
        </div>
        <div className={styles.AIans}>
          <div className={styles.chatContent}>
            <div className={styles.fadeTop}></div>
            {loading && <p style={{ marginTop: '1rem', color: '#888' }}>Thinking...</p>}

            {!loading && !currentChat && chatList.length === 0 && (
              <p style={{ color: "#aaa" }}>Ask something to get started.</p>
            )}

             {/* Only show jobs/skills output below the chat, after send */}
        {jobsData && (
          typeof jobsData === "string" ? (
            <div>
              <h3>Job Suggestions</h3>
              <p>{jobsData}</p>
            </div>
          ) : (
            <div>
              <h3>Extracted Skills</h3>
              <ul>
                {jobsData.extractedSkills?.map(skill => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
              <h3>Jobs</h3>
              {jobsData.jobs?.map(job => (
  <div key={job.id} style={{ border: "1px solid #ccc", margin: "1rem 0", padding: "1rem" }}>
    <h4>{job.title}</h4>
    <p>
      {job.company?.display_name} {job.location?.display_name ? `- ${job.location.display_name}` : ""}
    </p>
    <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">Apply</a>
    <p>{job.description?.substring(0, 2000)}.</p>
  </div>
))}
            </div>
          )
        )}
            {!loading && currentChat && (
              <div className={styles.chatBubble}>
                <hr style={{ marginTop: "1rem", marginBlock: "1rem", opacity: "0.3" }} />
                <button className={styles.Question}><h4>{currentChat.question}</h4></button>
                <FontAwesomeIcon className={styles.deleteIcon}
                  icon={faTrash}
                  title="Delete"
                  onClick={() => handleDeleteMessage(sessionId, currentChat.messageId)} />
                  {currentChat.extractedText && (
      <div className={styles.ocrText}>
        <strong>Extracted Text:</strong>
        <pre>{currentChat.extractedText}</pre>
      </div>
    )}
                <div className={styles.formattedReply}>
                  <FontAwesomeIcon
                    icon={copiedChatId === currentChat.question ? faCheck : faCopy}
                    title="Copy reply"
                    onClick={() => {
                      navigator.clipboard.writeText(currentChat.answer);
                      setCopiedChatId(currentChat.question);
                      setTimeout(() => setCopiedChatId(null), 2000);
                    }}
                    className={styles.copyIcon}
                  />
                  {formatReply(currentChat.answer)}
                </div>
              </div>
            )}

            {/* Chat history below when no currentChat selected */}
            {!loading && !currentChat && chatList.length > 0 && (
              sortedDateLabels.map(dateLabel => (
                <div key={dateLabel}>
                  <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{dateLabel}</h3>
                  {groupedChats[dateLabel].map((chat, index) => (
                    <div key={index} className={styles.chatBubble}>
                      <hr style={{ marginTop: "1rem", marginBlock: "1rem", opacity: "0.3" }} />
                      <button className={styles.Question}><h4>{chat.question}</h4></button>
                      <FontAwesomeIcon className={styles.deleteIcon}
                        icon={faTrash}
                        title="Delete"
                        onClick={() => handleDeleteMessage(sessionId, chat.messageId)} />
                        {chat.extractedText && (
      <div className={styles.ocrText}>
        <strong>Extracted Text:</strong>
        <pre>{chat.extractedText}</pre>
      </div>
    )}
                      <FontAwesomeIcon
                        icon={copiedChatId === chat.question ? faCheck : faCopy}
                        title="Copy reply"
                        onClick={() => {
                          navigator.clipboard.writeText(chat.answer);
                          setCopiedChatId(chat.question);
                          setTimeout(() => setCopiedChatId(null), 2000);
                        }}
                        className={styles.copyIcon}
                      />
                      <div className={styles.formattedReply}>{formatReply(chat.answer)}</div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
        <button title="Move to homePage" className={styles.AIcross} onClick={() => { router.push("/dashboard") }}>X</button>
      </div>
    </>
  );
}

export default AI;