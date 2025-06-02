import React, { useState, useEffect } from 'react';
import styles from './Edit.module.css';
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { updateUserProfileAndData, uploadProfilePicture, uploadBackgroundImage, getUserAndProfile } from '../../config/redux/action/authAction';
import { BASE_URL } from '@/config';

function Edit() {
  
  const dispatch = useDispatch();
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);

  const { user, profile } = useSelector((state) => state.auth);
 
  const handleImageClick = (imageType) => {
    if (imageType === "profile") {
      document.getElementById("profilePicInput").click();
    } else {
      document.getElementById("backgroundImgInput").click();
    }
  };

  const [formData, setFormData] = useState({
    bio: '',
    position: '',
    education: [{ school: "", fieldOfStudy: "", degree: "", years: { start: "", end: "" } }],
    pastWork: [{ company: "", position: "", years: "" }],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        position: profile.currentPosition || '',
        education: profile.education?.length
          ? profile.education.map((edu) => ({
              ...edu,
              years: {
                start: edu.years?.start || '',
                end: edu.years?.end || ''
              }
            }))
          : [{ school: '', fieldOfStudy: '', degree: '', years: { start: '', end: '' } }],
        pastWork: profile.pastWork?.length
          ? profile.pastWork
          : [{ company: '', position: '', years: '' }],
      });
    }
  
    if (user?.profilePicture) {
      setProfilePicture(`${BASE_URL}/uploads/${user.profilePicture}?t=${Date.now()}`);
    }
  
    if (user?.backgroundImage) {
      setBackgroundImage(`${BASE_URL}/uploads/${user.backgroundImage}?t=${Date.now()}`);
    }
  }, [profile, user]); // ✅ always two values
  
  

  const handleChange = (e, index, key, field, subField = null) => {
    if (key === 'education' || key === 'pastWork') {
      const updated = formData[key].map((item, i) => {
        if (i === index) {
          if (field === 'years' && subField) {
            return {
              ...item,
              years: {
                ...item.years,
                [subField]: e.target.value,
              },
            };
          } else {
            return {
              ...item,
              [field]: e.target.value,};
            }} return item;
      });
  
      setFormData((prev) => ({
        ...prev,
        [key]: updated,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    }
  };
  
  const handleAddField = (key) => {
    const newItem =
      key === 'education'
        ? { school: '', fieldOfStudy: '', degree: '', years: { start: '', end: '' } }
        : { company: '', position: '', years: '' };

    setFormData({ ...formData, [key]: [...formData[key], newItem] });
  };

    {/*profile picture */}
    const handleFileChange = async (e, imageType) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append(imageType === 'profile' ? 'profile_picture' : 'background_image', file);
        
        if (imageType === 'profile') {
          // Upload profile picture and update local state for preview
          await dispatch(uploadProfilePicture(formData)); 
          setProfilePicture(URL.createObjectURL(file)); // Preview profile picture immediately
        } else {
          // Upload background image and update local state for preview
          await dispatch(uploadBackgroundImage(formData));
          setBackgroundImage(URL.createObjectURL(file)); // Preview background image immediately
        }
      }
    };
    

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profileData = {
      bio: formData.bio,
      currentPosition: formData.position,
      education: formData.education,
      pastWork: formData.pastWork,
    };

    try {
      await dispatch(updateUserProfileAndData({ user, profileData })).unwrap();
      //console.log("Update successful:", result);
      await dispatch(getUserAndProfile());
      router.push("/Create");
    } catch (error) {
      if (error === "Profile update failed") {
        //console.warn("Silent error skip: profile update issue but changes applied.");
        router.push("/Create"); 
      } else {
        console.log("Update failed", error);
      }
    }
  };

  return (
    <div className={styles.Edits}>
        <div
        className={styles.BackGroundImg}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "",
          height: "200px", 
          backgroundSize: "cover",
          backgroundPosition: "center",
          
        }}
        onClick={() => handleImageClick("background")} 
      >
        <input
          type="file"
          id="backgroundImgInput"
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => handleFileChange(e, "background")}
        />
      </div>

      {/* Profile Picture Upload */}
      <div className={styles.avatarWrapper}>
        <div
          className={styles.editPro}
          onClick={() => handleImageClick("profile")}
          style={{ cursor: "pointer" }}
        >
          <img
            src={profilePicture || (user?.profilePicture ? `http://localhost:9000/uploads/${user.profilePicture}` : "/default.jpg")}
            alt="Avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%", 
            }}
          />
        </div>
        <input
          type="file"
          id="profilePicInput"
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => handleFileChange(e, "profile")}
        />
      </div>


      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <label>Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange(e, null, 'bio')}
            rows={3}
          />
        </div>

        <div className={styles.section}>
          <label>Current Position</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => handleChange(e, null, 'position')}
          />
        </div>

        <div className={styles.section}>
          <h3>Education</h3>
          {formData.education.map((edu, idx) => (
            <div key={idx} className={styles.eduEntry}>
              <input
                type="text"
                placeholder="School"
                value={edu.school}
                onChange={(e) => handleChange(e, idx, 'education', 'school')}
              />
              <input
                type="text"
                placeholder="Field of Study"
                value={edu.fieldOfStudy}
                onChange={(e) => handleChange(e, idx, 'education', 'fieldOfStudy')}
              />
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => handleChange(e, idx, 'education', 'degree')}
              />
              <input className={`${styles.inputField} ${styles.yearInput}`}
                type="number"
                placeholder="Start Year"
                value={edu.years?.start || ''}
                onChange={(e) => handleChange(e, idx, 'education', 'years', 'start')}
              />
              <input className={`${styles.inputField} ${styles.yearInput}`}
                type="number"
                placeholder="End Year"
                value={edu.years?.end || ''}
                onChange={(e) => handleChange(e, idx, 'education', 'years', 'end')}
              />
            </div>
          ))}
          <button
            type="button"
            className={styles.edit}
            onClick={() => handleAddField('education')}
          >
            + Add Education
          </button>
        </div>

        <div className={styles.section}>
          <h3>Past Work</h3>
          {formData.pastWork.map((work, idx) => (
            <div key={idx} className={styles.workEntry}>
              <input
                type="text"
                placeholder="Company"
                value={work.company}
                onChange={(e) => handleChange(e, idx, 'pastWork', 'company')}
              />
              <input
                type="text"
                placeholder="Position"
                value={work.position}
                onChange={(e) => handleChange(e, idx, 'pastWork', 'position')}
              />
              <input
                type="text"
                placeholder="Years"
                value={work.years}
                onChange={(e) => handleChange(e, idx, 'pastWork', 'years')}
              />
            </div>
          ))}
          <button
            type="button"
            className={styles.edit}
            onClick={() => handleAddField('pastWork')}
          >
            + Add Past Work
          </button>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn}>Save</button>
        </div>
      </form>
    </div>
  );
}

export default Edit;
