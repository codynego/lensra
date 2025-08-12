import React from "react";

const BookingConfirmation = ({ booking }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Booking Confirmation</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Booking Summary</h2>
        <p><strong>Client:</strong> {booking.client_name}</p>
        <p><strong>Email:</strong> {booking.client_email}</p>
        <p><strong>Date:</strong> {booking.date}</p>
        <p><strong>Time:</strong> {booking.start_time} - {booking.end_time}</p>
        <p><strong>Package:</strong> {booking.package_name}</p>
        <p><strong>Notes:</strong> {booking.notes || "None"}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        {/* Payment Placeholder */}
        <div className="mt-4">
          <p className="text-gray-600">Payment integration to be implemented.</p>
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Proceed to Payment (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;