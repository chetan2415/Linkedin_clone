import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
  if(token){
    const timer = setTimeout(() => {
      router.push("/dashboard");
    },4000);

    return () => clearTimeout(timer);
  }else{
    const timer = setTimeout(() => {
      router.push("/register");
    },4000);
    return () => clearTimeout(timer);
  }
  },[router]);
  
  return (
    <>
     <div className={styles.linkedContainer}>
      <div className={styles.linkedPage}>
          <img  onClick ={ () => { router.push("/register")}} className={styles.linkedImg} src="/linkedin-logo.jpg" alt="LinkedIn Logo" /><br/>
          <div className={styles.line}></div>
      </div>
     </div>
    </>
  );
}
