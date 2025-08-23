import { useState } from 'react';
import { X, Check, Edit2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import * as dateUtils from '../../utils/dateUtils';
import { useAuth } from '../../AuthContext';

const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};
const formatDate = (date) => {
  try {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'Africa/Lagos' 
    });
  } catch {
    return 'N/A';
  }
};

const formatTime = (date) => {
  try {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: 'Africa/Lagos' 
    });
  } catch {
    return 'N/A';
  }
};

const formatCurrency = (value) => {
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Utility to normalize time format to HH:mm:ss
const normalizeTime = (time) => {
    console.log('Normalizing Time:', time);
  if (!time) return '00:00:00';
  const parts = time.split(':');
  if (parts.length === 2) return `${time}:00`; // Add seconds if missing
  return time;
};

const BookingDetails = ({ booking, onClose, onAction, isDark }) => {
  const { apiFetch } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: booking.status || '',
    package_price: booking.package_price || '',
    session_date: booking.session_date || '',
    session_time: normalizeTime(booking.session_time) || '',
  });
  const [errors, setErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const sessionDateTime = dateUtils.createDateTime(booking.session_date, booking.session_time);
  const endDateTime = dateUtils.addHours(sessionDateTime, 1);


  const validateForm = () => {
    const newErrors = {};
    if (!formData.status || !Object.values(BOOKING_STATUS).includes(formData.status)) {
      newErrors.status = 'Please select a valid status';
    }
    if (!formData.package_price || Number(formData.package_price) <= 0) {
      newErrors.package_price = 'Price must be a positive number';
    }
    if (!formData.session_date) {
      newErrors.session_date = 'Date is required';
    }
    if (!formData.session_time) {
      newErrors.session_time = 'Time is required';
    } else {
      const testDateTime = dateUtils.createDateTime(formData.session_date, normalizeTime(formData.session_time));
      if (!testDateTime || isNaN(testDateTime.getTime())) {
        newErrors.session_time = 'Invalid date or time format (use YYYY-MM-DD for date and HH:mm or HH:mm:ss for time)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmissionStatus('loading');
      const response = await apiFetch(`/bookings/bookings/${booking.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.status,
          package_price: Number(formData.package_price),
          session_date: formData.session_date,
          session_time: normalizeTime(formData.session_time),
          
        }),
      });
      console.log('Update Payload:', { id: booking.id, ...formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update booking: ${response.status}`);
      }

      setSubmissionStatus('success');
      console.log('Booking Updated:', { id: booking.id, ...formData });
      onAction(booking.id, formData.status); // Trigger parent refresh
      setTimeout(() => {
        setIsEditing(false);
        setSubmissionStatus(null);
      }, 1500);
    } catch (err) {
      setSubmissionStatus('error');
      setErrors({ form: err.message || 'Failed to update booking' });
      console.error('Update Error:', err);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      status: booking.status || '',
      package_price: booking.package_price || '',
      session_date: booking.session_date || '',
      session_time: normalizeTime(booking.session_time) || '',
    });
    setErrors({});
    setIsEditing(false);
    setSubmissionStatus(null);
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-6 w-full max-w-2xl mx-auto ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm border border-gray-100'}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {isEditing ? 'Edit Booking' : 'Booking Details'}
        </h3>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isDark ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
              aria-label="Edit booking"
            >
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          <button
            onClick={() => {
              console.log('Closing Booking Modal');
              onClose();
            }}
            className={`p-2 rounded-lg transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            aria-label="Close details"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {submissionStatus === 'error' && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
          {errors.form || 'Failed to update booking. Please try again.'}
        </div>
      )}
      {submissionStatus === 'success' && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
          Booking updated successfully!
        </div>
      )}

      {isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`w-full p-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-200'} border focus:ring-2 focus:ring-indigo-500`}
              aria-label="Booking status"
            >
              <option value="">Select status</option>
              {Object.values(BOOKING_STATUS).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
          </div>
          <div>
            <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>Price ($)</label>
            <input
              type="number"
              name="package_price"
              value={formData.package_price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full p-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-200'} border focus:ring-2 focus:ring-indigo-500`}
              aria-label="Booking price"
            />
            {errors.package_price && <p className="text-xs text-red-500 mt-1">{errors.package_price}</p>}
          </div>
          <div>
            <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>Date</label>
            <input
              type="date"
              name="session_date"
              value={formData.session_date}
              onChange={handleInputChange}
              className={`w-full p-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-200'} border focus:ring-2 focus:ring-indigo-500`}
              aria-label="Booking date"
            />
            {errors.session_date && <p className="text-xs text-red-500 mt-1">{errors.session_date}</p>}
          </div>
          <div>
            <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>Time</label>
            <input
              type="time"
              name="session_time"
              value={formData.session_time.split(':').slice(0, 2).join(':')} // Convert HH:mm:ss to HH:mm
              onChange={handleInputChange}
              className={`w-full p-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-200'} border focus:ring-2 focus:ring-indigo-500`}
              aria-label="Booking time"
            />
            {errors.session_time && <p className="text-xs text-red-500 mt-1">{errors.session_time}</p>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Client', value: booking.client || 'Unknown' },
            { label: 'Email', value: booking.client_email || 'N/A' },
            { label: 'Date', value: booking.session_date || 'N/A' },
            { label: 'Time', value: sessionDateTime && endDateTime ? booking.session_time || 'N/A' : 'N/A' },
            { label: 'Package', value: booking.service_package || 'Unknown' },
            { label: 'Price', value: `$${formatCurrency(booking.package_price)}` },
            { label: 'Location', value: booking.location || 'N/A' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{label}</p>
              <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Status</p>
        <StatusBadge status={booking.status} isDark={isDark} />
      </div>

      {booking.notes && (
        <div className="mb-4">
          <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Notes</p>
          <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-gray-200 bg-gray-700/30' : 'text-gray-900 bg-gray-50'} p-3 rounded-xl`}>{booking.notes}</p>
        </div>
      )}

      <div className="flex gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleCancelEdit}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Cancel editing"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submissionStatus === 'loading'}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                isDark
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-600/50'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-600/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Save changes"
            >
              {submissionStatus === 'loading' ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : (
          booking.status === BOOKING_STATUS.PENDING && (
            <>
              <button
                onClick={() => {
                  console.log('Rejecting Booking from Modal:', { id: booking.id });
                  onAction(booking.id, 'CANCELLED');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isDark ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
                aria-label="Reject booking"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => {
                  console.log('Approving Booking from Modal:', { id: booking.id });
                  onAction(booking.id, 'CONFIRMED');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-200 shadow-md hover:shadow-lg focus:ring-4 focus:ring-indigo-500/20`}
                aria-label="Approve booking"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default BookingDetails;