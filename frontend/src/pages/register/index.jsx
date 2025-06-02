import React, { useState, useEffect } from 'react'; 
import styles from "../register/sign.module.css";
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {registerUser}  from '../../config/redux/action/authAction/index.js';
import {reset} from "../../config/redux/reducer/authReducer/index.js";

function Register() {  
    const router = useRouter(); 
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const { isLoading, isSuccess, isError, message } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    });

    useEffect(() => {
  dispatch(reset());
}, [dispatch]);

useEffect(() => {
  console.log("Auth State on Load:", { isLoading, isError, isSuccess, message });
}, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.username || !formData.email || !formData.password) {
        alert("Please fill in all fields.");
        return;
    }
    dispatch(registerUser(formData));
    };

    useEffect(() => {
        if (isSuccess) {
          setFormData({ name: "", username: "", email: "", password: "" });
          router.push("/Login");
          dispatch(reset()); 
        }
      }, [isSuccess, dispatch, router]);
      

    return ( 
        <div>
            <div className={styles.navbar}>
                <img onClick={() => router.push("/")} src='/linkedin-logo.jpg'/>
                <button onClick= {() => {router.push("/Login")}} className={styles.signBtn}>sign in</button>
            </div>
            <div className={styles.loginLeft}>
                <img style={{width:"60%", height:"70%"}} className={styles.loginImage} src="/sign.avif" alt="sign" />
            </div>
            <div className={styles.loginRight}>
                <form style={{ marginTop: "6rem" }} className={styles.loginForm} onSubmit={handleSubmit} required>

                    <label htmlFor='name'>User</label>
                    <input id="name" type="text" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required/>

                    <label htmlFor='name'>Username</label>
                    <input id="username" type="text" name="username" placeholder="Enter username" value={formData.username} onChange={handleChange} required/>

                    <label htmlFor='email'>Email</label>
                    <input id="email" type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required/>

                    <label htmlFor='password'>Password</label>
                        <div style={{ position: "relative" , width:"310px"}}>
                        <input id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{ paddingRight: "2.5rem"}}/>
                        <button type="button"
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

                    <button type="submit" className={styles.loginButton} disabled={isLoading}>
                        {isLoading ? "Signing up..." : "Sign up"}
                    </button>

                    {isError && (<p style={{ color: "red" }}>{message === "User already exists" ? "User already exists. Please sign in." : message} </p>)}
                    {isSuccess && <p style={{ color: "green" }}>Signup successful!</p>}

                    <div className={styles.orLine}>
                        <span>OR</span>
                    </div>

                    <button type="button" className={styles.googleButton}>
                        <img src="/google.jpg" alt="Google" />
                        Sign in with Google
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
