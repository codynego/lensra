import React, { useState, useEffect } from "react";
import axios from "axios";

const MyBookings = ({ token }) => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("/api/bookings/", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setBookings(response.data.results || response.data))
      .catch((err) => setError("Failed to load bookings."));
  }, []);

  const handleCancel = async (bookingId) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/`, { status: "cancelled" }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookings.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    } catch (err) {
      setError("Failed to cancel booking.");
    }
  };

  const handleReschedule = async (bookingId, newSlot) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/`, {
        date: newSlot.date,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookings.map((b) => b.id === bookingId ? { ...b, ...newSlot } : b));
    } catch (err) {
      setError("Failed to reschedule booking.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li key={booking.id} className="bg-white p-4 rounded-lg shadow">
              <p><strong>Date:</strong> {booking.date}</p>
              <p><strong>Time:</strong> {booking.start_time} - {booking.end_time}</p>
              <p><strong>Package:</strong> {booking.package_name}</p>
              <p><strong>Status:</strong> {booking.status}</p>
              <div className="flex space-x-2 mt-2">
                {booking.status !== "cancelled" && (
                  <>
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => alert("Reschedule feature to be implemented")} // Placeholder
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Reschedule
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookings;