import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, getUserAndProfile } from "@/config/redux/action/authAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome, faUserFriends, faBriefcase, faComments, faBuilding, faSearch, faCaretDown, faCaretUp
} from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/Navbar.module.css";
import axios from "axios";
import {logout as logoutAction} from "../config/redux/reducer/authReducer";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const { user } = useSelector((state) => state.auth || {});

  // Hide Navbar only on Login page
  //if (router.pathname === "/Login") return null;

  // Hide Navbar on specific pages
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      setIsNavbarVisible(false);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsNavbarVisible(true);
      }, 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Fetch all users for search
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Fetch user/profile if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if(!token) return;
    if (!user?._id) {
      dispatch(getUserAndProfile());
    }
  }, [dispatch, user?._id]);

  // Dropdown and search reset on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setShowDropdown(false);
      setSearchTerm("");
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, []);

  // Logout logic
  const logout = () => {
    console.log("logut clicked");
    dispatch(logoutAction());
    localStorage.removeItem("token");
    setShowDropdown(false);
    console.log("toekn removed, redirecting to login page")
    router.replace("/Login");
  }

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  // Search logic
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/userProfile/${searchTerm.trim()}`);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        axios.get(`http://localhost:9000/getUserBySearch?username=${searchTerm}`)
          .then(res => {
            setSuggestions([res.data.profile.userId]);
          })
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelect = (username) => {
    setSearchTerm('');
    setSuggestions([]);
    router.push(`/userProfile/${username}`);
  };

  return (
    <>
      <div className={`${styles.dashNavbar} bg-light border-bottom py-2`}
        style={{ top: isNavbarVisible ? 0 : "-100px", transition: "top 0.3s", position: "sticky", zIndex: 999 }}>
        <div className={`${styles.navbar} container-fluid d-flex align-items-center justify-content-between flex-wrap`}>

          <img src="/linkedin-logo.jpg" alt="Logo" className={styles.logo} />

          {/* Search Bar */}
         <form onSubmit={handleSearch} className="d-flex align-items-center position-relative me-3" ref={searchRef}>
          <div className={`${styles.searchContainer} position-relative me-2`}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              placeholder="Search"
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                setSuggestions([
                  { name: "Interview tips", type: "topic" },
                  { name: "Remote work", type: "topic" },
                  { name: "Balancing work and personal life", type: "topic" },
                  { name: "When is the best time to switch jobs", type: "topic" }
                ]);
              }}
            />
          </div>

          {suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (item.type === "topic") {
                      router.push({
                        pathname: "/NavSearch",
                        query: { q: item.name }
                      });
                    } else {
                      handleSelect(item.username);
                    }
                    setSuggestions([]);
                    setSearchTerm('');
                  }}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </form>


          {/* Navigation Buttons */}
          <div className={`${styles.navButtons} d-flex gap-3 flex-wrap`}>
            <div className={`${styles.navItem} ${router.pathname === "/dashboard" ? styles.active : ""}`} onClick={() => router.push("/dashboard")}>
              <FontAwesomeIcon icon={faHome} />
              <span>Home</span>
            </div>
            <div className={`${styles.navItem} ${router.pathname === "/network" ? styles.active : ""}`} onClick={() => router.push("/network")}>
              <FontAwesomeIcon icon={faUserFriends} />
              <span>Network</span>
            </div>
            <div className={`${styles.navItem} ${router.pathname === "/jobs" ? styles.active : ""}`} onClick={() => router.push("/jobs")}>
              <FontAwesomeIcon icon={faBriefcase} />
              <span>Jobs</span>
            </div>
            <div className={`${styles.navItem} ${router.pathname === "/messages" ? styles.active : ""}`} onClick={() => router.push("/messages")}>
              <FontAwesomeIcon icon={faComments} />
              <span>Messages</span>
            </div>
            <div className={`${styles.navItem} ${router.pathname === "/business" ? styles.active : ""}`} onClick={() => router.push("/business")}>
              <FontAwesomeIcon icon={faBuilding} />
              <span>Business</span>
            </div>
          </div>

          {/* User Profile */}
          <div className={`${styles.profileContainer} d-flex align-items-center position-relative`}>
            {user?.profilePicture ? (
              <img
                key={user?.profilePicture}
                src={
                  user?.profilePicture
                    ? `${"http://localhost:9000"}/uploads/${user.profilePicture}?t=${Date.now()}`
                    : "/default.jpg"
                }
                alt="Avatar" style={{ objectFit: "cover", width: "50%", height: "50%", borderRadius: "70%" }}
              />
            ) : (
              <div className={styles.profileInitials}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
            )}

            <button className={styles.dropdownButton} onClick={toggleDropdown}>
              <FontAwesomeIcon icon={showDropdown ? faCaretUp : faCaretDown} />
            </button>

            {showDropdown && (
              <div className={`${styles.dropdownMenu} bg-white shadow rounded position-absolute end-0 mt-2`}>
                <div onClick={() => { setShowDropdown(false); setTimeout(() => { router.push("/Edit"); }, 100); }} className={styles.dropdownItem}> Edit Profile</div>
                <div onClick={logout} className={styles.dropdownItem}>Sign Out</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;