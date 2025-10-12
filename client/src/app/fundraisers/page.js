"use client";
import React, { useContext, useEffect, useState } from "react";
import { get } from "../api";
import Link from "next/link";
import { AppContent } from "../context/AppContext";

const Fundraisers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AppContent); // Access the app context

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const data = await get(`/api/v1/users/all?page=${page}&limit=12`);
      if (data && data.users) {
        setUsers(data.users);
        
        setPagination(data.pagination);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [page, userData]);

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">
          Бүх хандив цуглуулагчид
        </h1>
        <p className="text-center text-gray-600 mb-8 sm:mb-12">
          Манай хандив цуглуулагчдын нийгэмлэгийг үзэж, дэмжээрэй.
        </p>
        {loading ? (
          <div className="text-center py-10">
            <p className="text-lg font-semibold">Ачаалж байна...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                            {user.totalDonatedAmount.toLocaleString()}₮
                            хандивласан
                          </span>
                          <span className="text-gray-500">
                            Зорилго: {user.goal.toLocaleString()}₮
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {pagination && (
              <div className="flex justify-center items-center mt-12 space-x-4">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 font-medium bg-white border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Өмнөх
                </button>
                <span className="text-sm text-gray-700">
                  Хуудас{" "}
                  <span className="font-bold">{pagination.currentPage}</span> /{" "}
                  <span className="font-bold">{pagination.totalPages}</span>
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 font-medium bg-white border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Дараах
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Fundraisers;
