"use client";
import React, { useContext, useEffect, useState } from "react";
import { get } from "../../api";
import { useParams } from "next/navigation";
import { AppContent } from "@/app/context/AppContext";

const UserProfile = () => {
  const params = useParams();

  const { id } = params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userData } = useContext(AppContent); // Access the app context


  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const data = await get(`/api/v1/users/${id}`);
          if (data && data.success) {
            setUser(data.user);
          } else {
            setError(data.message || "Failed to fetch user data.");
          }
        } catch (err) {
          setError(err.message || "An error occurred.");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, userData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">User not found.</p>
      </div>
    );
  }

  const progress =
    user.goal > 0
      ? Math.min((user.totalDonatedAmount / user.goal) * 100, 100)
      : 0;

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center text-center">
            <svg
              className="h-24 w-24 text-gray-300 mb-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clipRule="evenodd"
              />
            </svg>
            <h1 className="text-4xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{user.email}</p>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-3xl font-bold text-green-600">
                  ${user.totalDonatedAmount.toLocaleString()}
                </span>
                <span className="text-gray-500"> raised</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-medium text-gray-500">
                  Goal: ${user.goal.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-indigo-600 h-4 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors text-lg cursor-pointer">
              Support {user.name}'s donation goal
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Recent Donations
          </h2>
          {user.donations && user.donations.length > 0 ? (
            <ul className="space-y-4">
              {user.donations.map((donation) => (
                <li
                  key={donation._id}
                  className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {donation.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-600">{donation.message}</p>
                  </div>
                  <span className="font-bold text-lg text-green-600">
                    ${donation.amount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 px-4 bg-white rounded-lg shadow">
              <p className="text-gray-500">No donations yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
