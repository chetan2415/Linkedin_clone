import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faPeopleGroup,
  faNewspaper,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/Sidebar.module.css";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAndProfile } from "@/config/redux/action/authAction";

const Sidebar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.auth.profile);
  
  useEffect(() => {
    dispatch(getUserAndProfile());
  }, [dispatch]);

  return (
    <div className={styles.sidebar}>
      <button
        onClick={() => {
          router.push("/Create");
        }}
        className={styles.userPro}
      >
        <div className={styles.userdata}>
          <div className={styles.userAvatar}>
          <img
              key={user?.profilePicture}
              src={
                user?.profilePicture
                  ? `http://localhost:9000/uploads/${user.profilePicture}?t=${Date.now()}`
                  : "/default.jpg"
              }
              alt="Avatar" style={{objectFit:"cover", width:"100%", height:"100%", borderRadius:"70%"}}
            />

          </div>
          <div className={styles.userText}>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userSchool}>{profile?.education?.[0]?.school}</p>
            <p className={styles.userDegree}>{profile?.education?.[0]?.degree}</p>
          </div>
        </div>
      </button>


      <button onClick={() => router.push("/network")} className={styles.conn}>
        <div className={styles.connetions}>
          <h5>Connections</h5>
          <p>Connect with friends</p>
        </div>
      </button>
      <button onClick={() => router.push("/messages")} className={styles.items}>
       <div className={styles.info}>
          <ul>
            <li ><FontAwesomeIcon icon={faBookmark} /> Saved items</li>
            <li ><FontAwesomeIcon icon={faPeopleGroup} style={{fontSize:"12px"}}/> Groups</li>
            <li ><FontAwesomeIcon icon={faNewspaper} /> Newsletters</li>
            <li ><FontAwesomeIcon icon={faCalendarAlt} /> Events</li>
          </ul>
        </div>
      </button>
      <div className={styles.ai}>
        <button onClick ={() => {router.push("/AI")}}className={styles.aiBtn}>AI</button>
      </div>
    </div>
  );
};

export default Sidebar;
