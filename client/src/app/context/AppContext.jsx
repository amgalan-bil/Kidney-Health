"use client"; // This is crucial for a context provider using hooks

import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { get, post, patch } from "../api";
import { useRouter } from "next/navigation";

export const AppContent = createContext();

export const AppContextProvider = (props) => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null); // Use null as initial state
  const [loading, setLoading] = useState(true); // Add loading state, default to true
  const router = useRouter();

  // Check authentication status when the app loads
  const getAuthState = async () => {
    try {
      const data = await get("/api/v1/auth/is-auth");
      if (data.success) {
        setIsLoggedin(true);
        await getUserData(); // Wait for user data to be fetched
      } else {
        setIsLoggedin(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoggedin(false);
      setUserData(null);
    } finally {
      setLoading(false); // Set loading to false after the check is done
    }
  };

  // Fetch user data if logged in
  const getUserData = async () => {
    try {
      const data = await get("/api/v1/users/data");
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
        console.log(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  const updateUserGoal = async (goal) => {
    try {
      const data = await patch("/api/v1/users/goal", { goal });
      if (data.success) {
        // Update userData with the new goal information
        setUserData((prevData) => ({ ...prevData, goal: data.user.goal }));
        toast.success(data.message);
        await getUserData(); // Refresh user data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Failed to update goal:", error);
    }
  };

  // Handle user logout
  const logout = async () => {
    try {
      const data = await post("/api/v1/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        toast.success("Logged out successfully.");
        router.push("/"); // Redirect to home page after logout
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    logout,
    loading,
    updateUserGoal,
  };

  return (
    <AppContent.Provider value={value}>{props.children}</AppContent.Provider>
  );
};
