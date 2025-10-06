"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import Link from "next/link";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import { AppContent } from "../context/AppContext";
import { CircularProgress } from "@mui/material";

const AuthNav = () => {
  const { userData, logout, loading } = useContext(AppContent);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <CircularProgress size={24} color="inherit" />;
  }

  if (userData) {
    return (
      <div className="relative" ref={profileMenuRef}>
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center focus:outline-none transition-transform duration-300 hover:scale-110"
          aria-label="User menu"
        >
          <AccountCircleIcon
            fontSize="large"
            className="h-9 w-9 text-gray-500 hover:text-teal-600 cursor-pointer"
          />
        </button>
        {isProfileMenuOpen && (
          <div className="absolute left-0 md:right-0 md:left-auto mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-50 ring-1 ring-black ring-opacity-5">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-base font-medium text-gray-800 truncate">
                {userData?.name}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogoutIcon fontSize="small" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="py-2 px-3 font-medium text-gray-600 hover:text-teal-600 transition-colors"
    >
      Login
    </Link>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userData, logout, loading } = useContext(AppContent);

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-2xl font-bold text-teal-600 hover:text-teal-700 transition-colors"
              >
                Smiles for Mongolia
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-5">
              <Link
                href="/donate"
                className="bg-[#344CB7] hover:bg-[#1e2770] active:bg-[#000957] text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <VolunteerActivismIcon fontSize="small" />
                <span>Хандив өгөх</span>
              </Link>
              <div className="h-8 w-px bg-gray-200"></div>
              <AuthNav />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-teal-600 focus:outline-none"
                aria-label="Open main menu"
              >
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 p-4">
          <div className="flex justify-between items-center mb-10">
            {/* <span className="text-xl font-bold text-teal-600">Menu</span> */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-500 hover:text-teal-600"
              aria-label="Close main menu"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex flex-col gap-y-6">
            <div className="flex items-center gap-2 border-b pb-4">
              <AccountCircleIcon
                fontSize="large"
                className="h-9 w-9  text-teal-600 "
              />{" "}
              <p className="text-black"> {userData?.name}</p>
            </div>
            <Link
              href="/donate"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-[#344CB7] active:bg-[#000957] text-white w-full text-center py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <VolunteerActivismIcon fontSize="small" />
              <span>Хандив өгөх</span>
            </Link>
            {userData ? (
              <button
                className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors bg-red-600 hover:bg-red-700 text-white"
                onClick={logout}
              >
                <LogoutIcon fontSize="small" />
                sign out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors bg-teal-600 hover:bg-teal-700 text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
