"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import Link from "next/link";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import { AppContent } from "../context/AppContext";
import { CircularProgress } from "@mui/material";
import Image from "next/image";
import GoalModal from "./goalModal";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const AuthNav = ({ onSetGoalClick }) => {
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
              <Link
                href={`/profile/${userData.userId}`}
                className="bg-blue-500 hover:bg-blue-700 text-white  font-bold py-2 px-4 rounded flex items-center gap-2"
              >
                Миний профайл <ArrowForwardIcon />
              </Link>

              <p className="text-base font-medium text-gray-800 truncate">
                {userData?.name}
              </p>
              <p className="text-sm text-gray-500">
                Миний зорилго: {userData?.goal?.toLocaleString() || 0}₮
              </p>
              <p className="text-sm text-teal-500">
                Миний хандивласан:{" "}
                {userData?.raisedAmount?.toLocaleString() || 0}₮
              </p>
            </div>
            <button
              onClick={() => {
                onSetGoalClick();
                setIsProfileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <EditIcon fontSize="small" />
              <span>Зорилго тавих</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogoutIcon fontSize="small" />
              <span>Гарах</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 gap-2"
    >
      Нэвтрэх
    </Link>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const { userData, logout, updateUserGoal } = useContext(AppContent);

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className=" flex flex-row items-center justify-center gap-2 text-2xl font-bold text-black transition-colors"
              >
                <Image
                  src="/icon.jpg"
                  alt="Brilliant Minds Global Logo"
                  width={55}
                  height={55}
                  className="rounded-2xl"
                />{" "}
                Brilliant Minds Global
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-5">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 gap-2"
              >
                <VolunteerActivismIcon fontSize="small" />
                <span>Хандив өгөх</span>
              </Link>
              <div className="h-8 w-px bg-gray-200"></div>
              <AuthNav onSetGoalClick={() => setIsGoalModalOpen(true)} />
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
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-500 hover:text-teal-600"
              aria-label="Close main menu"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex flex-col gap-y-6">
            {userData && (
              <div className="flex items-center gap-2 border-b pb-4">
                <AccountCircleIcon
                  fontSize="large"
                  className="h-9 w-9 text-teal-600"
                />

                <div className="flex flex-col">
                  <p className="text-black">{userData?.name}</p>
                  <p className="text-sm text-gray-500">
                    Миний зорилго: {userData?.goal?.toLocaleString() || 0}₮
                  </p>
                  <p className="text-sm text-teal-500">
                    Миний хандивласан:{" "}
                    {userData?.raisedAmount?.toLocaleString() || 0}₮
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsGoalModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="ml-auto text-sm text-blue-600 cursor-pointer"
                >
                  Зорилго тавих
                </button>
              </div>
            )}
            <Link
              href="/donate"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 gap-2"
            >
              <VolunteerActivismIcon fontSize="small" />
              <span>Хандив өгөх</span>
            </Link>
            <Link
              href={`/profile/${userData.userId}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-blue-500 hover:bg-blue-700 text-white text-center font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              Миний профайл <ArrowForwardIcon />
            </Link>
            {userData ? (
              <button
                className="inline-flex items-center justify-center px-6 py-3 border border-red-600 text-base font-medium rounded-md text-red-600 gap-2"
                onClick={logout}
              >
                <LogoutIcon fontSize="small" />
                Гарах
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 gap-2"
              >
                Нэвтрэх
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={updateUserGoal}
      />
    </>
  );
};

export default Navbar;
