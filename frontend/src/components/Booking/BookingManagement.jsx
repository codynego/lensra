import React, { useState, useEffect } from "react";
import { 
  CheckIcon, 
  XIcon, 
  TrashIcon, 
  PlusIcon, 
  EyeIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  CameraIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/outline";
import { useApi } from "../../useApi"; // Assuming useApi is in the same directory or adjust path
import { useAuth } from "../../AuthContext"; // Adjust path as needed


const BookingManagement = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newSlot, setNewSlot] = useState({ start_time: "", end_time: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { apiFetch } = useApi();
  const { isAuthenticated } = useAuth(); // Use if needed for auth checks

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    todaysBookings: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  useEffect(() => {
    fetchTimeSlots(selectedDate);
  }, [selectedDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`bookings/bookings/`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      console.log("bookings")
      setBookings(data);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const totalBookings = data.length;
      const pendingBookings = data.filter(b => b.status === 'pending').length;
      const todaysBookings = data.filter(b => b.date === today).length;
      const revenue = data.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
      setStats({ totalBookings, pendingBookings, todaysBookings, revenue });
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    try {
      const response = await apiFetch(`bookings/time-slots/?date=${formattedDate}`);
      if (!response.ok) throw new Error("Failed to fetch time slots");
      const data = await response.json();
      setTimeSlots(data.map(slot => ({ ...slot, is_available: !slot.is_booked })));
    } catch (err) {
      setError(err.message || "Failed to fetch time slots");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedBooking(null);
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const response = await apiFetch(`bookings/bookings/${bookingId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: action }),
      });
      if (!response.ok) throw new Error(`Failed to ${action} booking`);
      fetchBookings(); // Refresh bookings
      setSelectedBooking(null);
    } catch (err) {
      setError(err.message || `Failed to ${action} booking`);
    }
  };

  const addTimeSlot = async () => {
    if (!newSlot.start_time || !newSlot.end_time || !newSlot.date) {
      setError("Please fill in all fields for the new time slot.");
      return;
    }
    
    try {
      const response = await apiFetch(`bookings/time-slots/`, {
        method: 'POST',
        body: JSON.stringify({
          date: newSlot.date,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          is_booked: false // Available by default
        }),
      });
      if (!response.ok) throw new Error("Failed to add time slot");
      setNewSlot({ start_time: "", end_time: "", date: "" });
      setShowSlotModal(false);
      setError(null);
      fetchTimeSlots(selectedDate); // Refresh
    } catch (err) {
      setError(err.message || "Failed to add time slot");
    }
  };

  const deleteTimeSlot = async (slotId) => {
    try {
      const response = await apiFetch(`/bookings/time-slots/${slotId}/`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Failed to delete time slot");
      fetchTimeSlots(selectedDate); // Refresh
    } catch (err) {
      setError(err.message || "Failed to delete time slot");
    }
  };

  const toggleSlotAvailability = async (slotId) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return;

    const newIsBooked = slot.is_available; // Since is_available = !is_booked

    try {
      const response = await apiFetch(`bookings/time-slots/${slotId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_booked: newIsBooked }),
      });
      if (!response.ok) throw new Error("Failed to toggle availability");
      fetchTimeSlots(selectedDate); // Refresh
    } catch (err) {
      setError(err.message || "Failed to toggle availability");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBookings = bookings.filter(booking => {
   
    if (activeTab === 'upcoming') return ['confirmed', 'upcoming'].includes(booking.status);
    if (activeTab === 'pending') return booking.status === 'pending';
    if (activeTab === 'past') return ['cancelled'].includes(booking.status);
    return true;
  });
  // Simple calendar component
  const Calendar = () => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    // Previous month's trailing days
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month's leading days
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    const navigateMonth = (direction) => {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + direction);
        return newDate;
      });
    };

    const isSelected = (date) => {
      return selectedDate.toDateString() === date.toDateString();
    };

    const isToday = (date) => {
      return today.toDateString() === date.toDateString();
    };

    return (
      <div className="w-full">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
              className={`
                p-2 text-sm rounded-lg transition-colors
                ${day.isCurrentMonth 
                  ? 'text-gray-900 hover:bg-gray-100' 
                  : 'text-gray-400'
                }
                ${isSelected(day.date) 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : ''
                }
                ${isToday(day.date) && !isSelected(day.date)
                  ? 'bg-indigo-100 text-indigo-600'
                  : ''
                }
              `}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <CameraIcon className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Booking Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <BellIcon className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <CogIcon className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todaysBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
              <XIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {['upcoming', 'pending', 'past'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                        activeTab === tab
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab} {tab === 'pending' && stats.pendingBookings > 0 && (
                        <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs font-medium">
                          {filteredBookings.length}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Bookings List */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600">Loading bookings...</span>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-500">No {activeTab} bookings at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="font-semibold text-gray-900 mr-3">{booking.client_name}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 space-y-1 sm:space-y-0 sm:space-x-4">
                              <span className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                {booking.date}
                              </span>
                              <span className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {booking.start_time} - {booking.end_time}
                              </span>
                              <span className="flex items-center">
                                <CameraIcon className="w-4 h-4 mr-1" />
                                {booking.package_name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              aria-label="View details"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            {activeTab === "pending" && (
                              <>
                                <button
                                  onClick={() => handleBookingAction(booking.id, "confirmed")}
                                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  aria-label="Approve"
                                >
                                  <CheckIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleBookingAction(booking.id, "cancelled")}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  aria-label="Reject"
                                >
                                  <XIcon className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Booking Details Modal */}
            {selectedBooking && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-medium text-gray-900">{selectedBooking.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedBooking.client_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.date} at {selectedBooking.start_time} - {selectedBooking.end_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Package</p>
                    <p className="font-medium text-gray-900">{selectedBooking.package_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  {selectedBooking.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-medium text-gray-900">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
                
                {/* Action buttons for pending bookings */}
                {selectedBooking.status === 'pending' && (
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => handleBookingAction(selectedBooking.id, "cancelled")}
                      className="flex-1 flex items-center justify-center px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <XIcon className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleBookingAction(selectedBooking.id, "confirmed")}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Calendar</h3>
              <Calendar />
            </div>

            {/* Time Slots */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Time Slots</h3>
                <button
                  onClick={() => setShowSlotModal(true)}
                  className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Slot
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">{selectedDate.toDateString()}</p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {timeSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">No time slots for this date.</p>
                ) : (
                  timeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        slot.is_available 
                          ? "bg-green-50 border-green-200 hover:bg-green-100" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          slot.is_available ? "bg-green-500" : "bg-gray-400"
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {slot.start_time} - {slot.end_time}
                        </span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          slot.is_available 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {slot.is_available ? "Available" : "Blocked"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => toggleSlotAvailability(slot.id)}
                          className={`p-1 rounded transition-colors ${
                            slot.is_available 
                              ? "text-orange-600 hover:bg-orange-50" 
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={slot.is_available ? "Mark as blocked" : "Mark as available"}
                        >
                          {slot.is_available ? (
                            <XIcon className="w-4 h-4" />
                          ) : (
                            <CheckIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteTimeSlot(slot.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete time slot"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Time Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Time Slot</h3>
              <button
                onClick={() => setShowSlotModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  className="w-full p-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSlotModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTimeSlot}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;