import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const router = useRouter();
  const hiddenRoutes = ["/", "/Login", "/register", "/AI", "/Simon", "/Sudoku", "/Maze", "/Resume"];
  const hideSidebarRoutes = ["/NavSearch", "/JobsSort"];
  const isResumeIdRoute = router.pathname === "/Resume/[id]";
  const hideNavbarAndSidebar = hiddenRoutes.includes(router.pathname) || isResumeIdRoute;
  const hideSidebarOnly = hideSidebarRoutes.includes(router.pathname);

  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [isTokenThere, setIsTokenThere] = useState(false);

  // Check token on route change
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsTokenThere(!!token);
    setIsTokenChecked(true);
  }, [router.pathname]);

  // Sync token state across tabs
  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("token");
      setIsTokenThere(!!token);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!isTokenChecked) return;

    // Redirect to login if no token and not on a public route
    if (!isTokenThere && !hiddenRoutes.includes(router.pathname)) {
      router.replace("/Login");
    }

    // Redirect to dashboard if logged in and on /Login
    if (isTokenThere && router.pathname === "/Login") {
      router.replace("/dashboard");
    }

    // Optional: Redirect from "/" to "/dashboard" if logged in
    if (isTokenThere && router.pathname === "/") {
      router.replace("/dashboard");
    }
  }, [isTokenChecked, isTokenThere, router.pathname]);

  if (!isTokenChecked) return null;

  return (
    <div>
      {!hideNavbarAndSidebar && isTokenThere && <Navbar />}
      <div>
        {!hideNavbarAndSidebar && isTokenThere && !hideSidebarOnly && <Sidebar />}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Layout;