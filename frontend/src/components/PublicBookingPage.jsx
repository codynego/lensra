import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const PublicBookingPage = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", notes: "" });
  const [error, setError] = useState(null);

  // Fetch packages
  useEffect(() => {
    axios.get("/api/packages/").then((response) => {
      setPackages(response.data.results || response.data);
    }).catch((err) => setError("Failed to load packages."));
  }, []);

  // Fetch available time slots for selected date
  useEffect(() => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    axios.get(`/api/time-slots/?date=${formattedDate}&is_available=true`)
      .then((response) => setTimeSlots(response.data.results || response.data))
      .catch((err) => setError("Failed to load time slots."));
  }, [selectedDate]);

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedPackage || !formData.name || !formData.email || !formData.selectedSlot) {
      setError("Please complete all fields.");
      return;
    }
    try {
      await axios.post("/api/bookings/", {
        package: selectedPackage.id,
        date: selectedDate.toISOString().split("T")[0],
        start_time: formData.selectedSlot.start_time,
        end_time: formData.selectedSlot.end_time,
        client_name: formData.name,
        client_email: formData.email,
        notes: formData.notes,
      });
      // Redirect to confirmation page or show success message
      setError(null);
      alert("Booking submitted!");
    } catch (err) {
      setError("Failed to submit booking.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Book a Photography Session</h1>
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
      
      {/* Packages */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Select a Package</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-4 rounded-lg border ${selectedPackage?.id === pkg.id ? "border-blue-600" : "border-gray-300"}`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <h3 className="font-medium">{pkg.name}</h3>
              <p className="text-gray-600">${pkg.price}</p>
              <p>{pkg.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar and Slot Picker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Select Date</h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileDisabled={({ date }) => {
              // Disable dates with no available slots (requires API integration)
              return false;
            }}
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Available Slots</h2>
          {timeSlots.length === 0 ? (
            <p>No available slots for this date.</p>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  className={`w-full p-2 rounded-lg ${formData.selectedSlot?.id === slot.id ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  onClick={() => setFormData({ ...formData, selectedSlot: slot })}
                >
                  {slot.start_time} - {slot.end_time}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Form */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Booking Form</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleBooking}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicBookingPage;