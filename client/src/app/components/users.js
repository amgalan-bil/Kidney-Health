"use client";
import React, { useContext, useEffect, useState } from "react";
import { get } from "../api";
import Link from "next/link";
import { AppContent } from "../context/AppContext";

const Users = () => {
  const [users, setUsers] = useState([]);
  const { userData } = useContext(AppContent); // Access the app context

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await get("/api/v1/users/all?page=1&limit=6");
      if (data && data.users) {
        setUsers(data.users);
      }
    };
    fetchUsers();
  }, [userData]);

  return (
    <div className="bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">
          Хамгийн их хандив өгсөн хүмүүс
        </h1>
        <Link
          href="/fundraisers"
          className="inline-flex items-center justify-center px-6 py-3 border  border-blue-600 text-base font-medium rounded-md text-blue-600"
        >
          Бүх хандив өгсөн хүмүүсийн харах

          <svg
            className="w-5 h-5 ml-2 -mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {users.map((user) => {
            const progress =
              user.goal > 0
                ? Math.min((user.totalDonatedAmount / user.goal) * 100, 100)
                : 0;

            return (
              <Link href={`/profile/${user._id}`} key={user._id}>
                <div className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out overflow-hidden cursor-pointer h-full flex flex-col group">
                  <div className="p-6 flex-grow">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-12 w-12 text-gray-300"
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
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600">
                          {user.name}
                        </h2>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-green-600">
                        ${user.totalDonatedAmount.toLocaleString()} Raised
                      </span>
                      <span className="text-gray-500">
                        Goal: ${user.goal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Users;
