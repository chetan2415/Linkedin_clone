import React, { useEffect, useState } from "react";
import styles from "./network.module.css";
import {  useSelector } from "react-redux";
import { getAllUsers } from "../../config/redux/action/authAction";
import { useRouter } from "next/router";

function Network() {
  //const dispatch = useDispatch();
  const router = useRouter();

  const { allUsers = [], isLoading, isError, message, user: currentUser } = useSelector(
    (state) => state.auth || {}
  );

  // Handle profile click
  const handleProfileClick = (username) => {
    router.push(`/userProfile/${username}`);
  };

  return (
    <div>
      {/* Users Section */}
      <div className={styles.networkContainer}>
        {isLoading ? (
          <p>Loading users...</p>
        ) : isError ? (
          <p style={{ color: "red" }}>{message}</p>
        ) : (
          allUsers
            .filter((user) => user._id !== currentUser?._id)
            .map((user, index) => (
              <div
                key={index}
                className={styles.card}
                onClick={() => handleProfileClick(user.username)}
                style={{ cursor: "pointer" }}
              >
                <span className={styles.cross}>✖</span>
                {user.profilePicture ? (
                  <img
                    className={styles.NetworkProfile}
                    key={user?.profilePicture}
                    src={
                      user?.profilePicture
                        ? `${"http://localhost:9000"}/uploads/${user.profilePicture}?t=${Date.now()}`
                        : "/default.jpg"
                    }
                  />
                ) : (
                  <div className={styles.NetworkAvatar}>
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <h3>{user.name}</h3>
                <p>{user.profile?.currentPosition || user.email}</p>
                <span className={styles.type}>
                  {user.profile?.type || "Not Specified"}
                </span>
                <br />
                {currentUser && user._id !== currentUser._id && (
                  <button className={styles.nBtn}>Connect</button>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default Network;