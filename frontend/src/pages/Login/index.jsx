import React, { useState, useEffect } from 'react'
import styles from "../Login/login.module.css"
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, resetPassword } from '../../config/redux/action/authAction/index.js'
import { reset } from "../../config/redux/reducer/authReducer/index.js"
function Login() {
  const dispatch = useDispatch()
  const { isLoading, isSuccess, isError, message } = useSelector((state) => state.auth)
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isResetPassword, setIsResetPassword] = useState(false)
  const [localError, setLocalError] = useState(null) // For local validation errors
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  useEffect(() => {
    dispatch(reset()) // Reset state on component mount
  }, [dispatch]);
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError(null)
    console.log("Form Data:", formData);
    if (!formData.email || !formData.password) {
      setLocalError("Please enter both email and password.");
      return;
    }
    if (isResetPassword) {
      if (formData.newPassword === formData.confirmPassword) {
        // Dispatch expects an object payload
        dispatch(resetPassword({ email: formData.email, newPassword: formData.newPassword }))
      } else {
        setLocalError("Passwords do not match.")
      }
    } else {
      dispatch(loginUser({ email: formData.email, password: formData.password }))
    }
  }

  useEffect(() => {
  if (isSuccess) {
    if (isResetPassword) {
      setIsResetPassword(false); 
      router.replace("/Login");
    } else {
      router.replace("/dashboard");
    }
  }
}, [isSuccess, router, isResetPassword]);


  return (
    <div>
      <div className={styles.navbar}>
        <img onClick={() => router.push("/")} src="/linkedin-logo.jpg" alt="Logo" />
        <button className={styles.signBtn} onClick={() => router.push('/register')}>Signup</button>
      </div>

      <div className={styles.loginLeft}>
        <img className={styles.loginImage} src="/login.jpg" alt="Login" />
      </div>

      <div className={styles.loginRight}>
        <form className={styles.loginForm} onSubmit={handleSubmit}>

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {!isResetPassword ? (
            <>
             <label htmlFor="password">Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 0.75rem",
                    color: "#0073b1"
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </>
          ) : (
            <>
              <label htmlFor="newPassword">New Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 0.75rem",
                    color: "#0073b1"
                  }}
                  tabIndex={-1}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>

              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 0.75rem",
                    color: "#0073b1"
                  }}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </>
          )}

          <div className={styles.forgotPassword}>
            {!isResetPassword ? (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setIsResetPassword(true)
                }}
              >
                Forgot Password
              </a>
            ) : (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setIsResetPassword(false)
                }}
              >
                Back to Login
              </a>
            )}
          </div>

          <button type="submit" className={styles.loginButton} disabled={isLoading}>
            {isLoading ? "Processing..." : isResetPassword ? "Reset Password" : "Sign in"}
          </button>

          {/* Show validation or backend errors */}
          {(localError || isError) && (
            <p style={{ color: "red" }}>
              {localError || (message?.message ? message.message : message)}
            </p>
          )}

          {isSuccess && !isResetPassword && (
            <p style={{ color: "green" }}>Signin successful!</p>
          )}

          <div className={styles.orLine}>
            <span>OR</span>
          </div>

          <button type="button" className={styles.googleButton} disabled>
            <img src="/google.jpg" alt="Google" />
            Sign in with Google 
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
