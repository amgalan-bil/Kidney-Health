import React, { useState, useEffect } from "react";
import { get } from "../api";

// Helper to get initials from a name
const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  return name.charAt(0).toUpperCase();
};

const Donors = ({ userId }) => {
  const [donations, setDonations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const limit = 10;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchDonors = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await get(
          `/api/v1/users/userDonors/${userId}?page=${page}&limit=${limit}`
        );

        console.log(data);
        
        if (data.success) {
          setDonations(data.donors);
          setTotalPages(data.pagination.totalPages);
        } else {
          throw new Error(data.message || "Failed to fetch donors");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [userId, page]);

  const handlePrevious = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNext = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white text-gray-800 p-4 sm:p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-12">
      <h3 className="text-xl font-bold mb-4">Recent Donations</h3>
      {donations.length > 0 ? (
        <ul className="space-y-4">
          {donations.map((donation) => (
            <li
              key={donation._id}
              className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                {getInitials(donation.name)}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{donation.name}</span>
                  <span className="font-bold text-blue-600">
                    {donation.amount.toLocaleString()} ₮
                  </span>
                </div>
                {donation.message && (
                  <p className="text-gray-600 italic my-1">
                    "{donation.message}"
                  </p>
                )}
                <small className="text-gray-400">
                  {new Date(donation.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </small>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-8">
          This user has not received any donations yet.
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            onClick={handlePrevious}
            disabled={page <= 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Previous
          </button>
          <span className="font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Donors;
