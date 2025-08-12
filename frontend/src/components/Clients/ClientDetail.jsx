import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, User, ChevronRight, Edit2, Plus, Mail, Phone, X, MessageCircle } from 'lucide-react';
import { useApi } from '../../useApi';

// API base URL from environment variable or fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ClientDetail = ({ client, onBack, onEdit, onCreateBooking }) => {
  const { apiFetch } = useApi();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [packages, setPackages] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedPhotographerId, setSelectedPhotographerId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null); // Track selected slot ID
  const [formData, setFormData] = useState({
    package: '',
    date: '',
    start_time: '',
    location: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      loadClientBookings();
      loadPackages();
    }
  }, [client]);

  const loadClientBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await apiFetch(`${API_BASE_URL}/api/bookings/bookings/`, {
        method: 'GET',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error (Bookings):', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Filter bookings for this client using the correct field names
      const clientBookings = data.filter(booking => 
        booking.client === client.id || 
        booking.client_id === client.id ||
        booking.client_name === client.name
      );
      setBookings(clientBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadPackages = async () => {
    try {
      setLoadingPackages(true);
      console.log('=== LOADING PACKAGES ===');
      
      const response = await apiFetch(`${API_BASE_URL}/api/bookings/packages/`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error (Packages):', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Packages loaded:', data);
      
      setPackages(data);
    } catch (err) {
      console.error('❌ Error loading packages:', err);
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadTimeSlots = async (date, photographerId) => {
    console.log('=== LOADING TIME SLOTS ===');
    console.log('📅 Date:', date);
    console.log('👤 Photographer ID:', photographerId);

    if (!photographerId || !date) {
      console.log('❌ Missing required params');
      setTimeSlots([]);
      setLoadingTimeSlots(false);
      return;
    }

    try {
      setLoadingTimeSlots(true);
      
      const url = `${API_BASE_URL}/api/bookings/time-slots/?photographer=${encodeURIComponent(photographerId)}&date=${encodeURIComponent(date)}`;
      console.log('🌐 Request URL:', url);
      
      const response = await apiFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error (Time Slots):', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Raw time slots:', data);

      // Filter available slots
      const availableSlots = data.filter(slot => !slot.is_booked);
      console.log('✅ Available slots:', availableSlots);
      setTimeSlots(availableSlots);
    } catch (err) {
      console.error('❌ Error loading time slots:', err);
      setTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('=== INPUT CHANGE ===');
    console.log('📝 Field:', name, 'Value:', value);

    // Update form data
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      console.log('📋 Updated form data:', newData);
      return newData;
    });

    // Clear previous errors
    if (formErrors[name]) {
      setFormErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }

    if (name === 'package' && value) {
      const selectedPackage = packages.find((pkg) => pkg.id === parseInt(value, 10));
      console.log('✅ Selected package:', selectedPackage);

      if (selectedPackage) {
        // Reset time slot selection
        setFormData((prev) => ({
          ...prev,
          start_time: ''
        }));
        setSelectedSlotId(null);

        // Set selected photographer ID
        const photographerId = selectedPackage.photographer;
        setSelectedPhotographerId(photographerId);

        // Load time slots if date is selected
        if (formData.date && photographerId) {
          console.log('🚀 Loading time slots for package change');
          loadTimeSlots(formData.date, photographerId);
        } else {
          setTimeSlots([]);
        }
      } else {
        setFormData((prev) => ({ ...prev, start_time: '' }));
        setTimeSlots([]);
        setSelectedPhotographerId(null);
        setSelectedSlotId(null);
      }
    }

    if (name === 'date' && value && formData.package) {
      const currentPackage = packages.find((pkg) => pkg.id === parseInt(formData.package, 10));

      if (currentPackage?.photographer) {
        // Reset time slot selection
        setFormData((prev) => ({ ...prev, start_time: '' }));
        setSelectedSlotId(null);
        
        const photographerId = selectedPhotographerId || currentPackage.photographer;
        loadTimeSlots(value, photographerId);
      } else {
        setFormData((prev) => ({ ...prev, start_time: '' }));
        setTimeSlots([]);
        setSelectedSlotId(null);
      }
    }

    if (name === 'start_time' && value) {
      // Find the selected slot and store its ID
      const selectedSlot = timeSlots.find(slot => slot.start_time === value);
      if (selectedSlot) {
        setSelectedSlotId(selectedSlot.id);
        console.log('🕐 Selected slot ID:', selectedSlot.id);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.package) errors.package = 'Please select a package';
    if (!formData.date) errors.date = 'Please select a date';
    if (!formData.start_time) {
      errors.start_time = 'Please select a time slot';
    } else {
      // Verify start_time is valid and we have slot ID
      const selectedSlot = timeSlots.find(slot => slot.start_time === formData.start_time);
      if (!selectedSlot) {
        errors.start_time = 'Selected time slot is not available';
      }
    }
    if (!formData.location.trim()) errors.location = 'Please enter a location';
    if (!selectedPhotographerId) errors.photographer = 'No photographer selected';
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== FORM SUBMISSION ===');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      console.log('❌ Validation failed:', errors);
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const selectedPackage = packages.find((pkg) => pkg.id === parseInt(formData.package, 10));
      
      if (!selectedPackage || !selectedPhotographerId || !selectedSlotId) {
        console.log('❌ Missing required data');
        setFormErrors({ general: 'Invalid package, photographer, or time slot selected.' });
        return;
      }

      // Create payload that matches the updated serializer and view expectations
      const payload = {
        client: client.id, // Include client ID for authenticated bookings
        photographer: selectedPhotographerId,
        package: parseInt(formData.package, 10),
        date: formData.date,
        start_time: formData.start_time,
        location: formData.location.trim(),
        notes: formData.notes.trim() || '',
        slot_id: selectedSlotId, // Include slot_id as expected by the view
      };

      console.log('📤 Submitting booking:', payload);

      const response = await apiFetch(`${API_BASE_URL}/api/bookings/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Booking created successfully:', result);
        
        // Reload bookings and close form
        await loadClientBookings();
        closeBookingForm();
        
        // Show success message (you can add a toast notification here)
        alert('Booking created successfully!');
        
      } else {
        // Read the response body once and handle both JSON and text
        const responseText = await response.text();
        let errorData;
        
        try {
          // Try to parse as JSON first
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          // If JSON parsing fails, treat as plain text
          errorData = { message: responseText || 'Unknown server error' };
        }
        
        console.error('❌ Booking creation failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        // Handle different types of error responses
        if (typeof errorData === 'string') {
          setFormErrors({ general: errorData });
        } else if (Array.isArray(errorData)) {
          setFormErrors({ general: errorData[0] || 'Failed to create booking.' });
        } else if (errorData.non_field_errors) {
          setFormErrors({ general: errorData.non_field_errors[0] || 'Failed to create booking.' });
        } else if (errorData.detail) {
          setFormErrors({ general: errorData.detail });
        } else if (errorData.message) {
          setFormErrors({ general: errorData.message });
        } else {
          // Handle field-specific errors
          const fieldErrors = {};
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              fieldErrors[key] = errorData[key][0];
            } else {
              fieldErrors[key] = errorData[key];
            }
          });
          setFormErrors(Object.keys(fieldErrors).length ? fieldErrors : { general: 'Failed to create booking.' });
        }
      }
    } catch (err) {
      console.error('❌ Error creating booking:', err);
      setFormErrors({ general: 'Failed to create booking. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (client.phone) {
      const phoneNumber = client.phone.replace(/[^0-9+]/g, '');
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=Hello%20${encodeURIComponent(client.name)},%20I'm%20reaching%20out%20regarding%20your%20booking.`;
      window.location.href = whatsappUrl;
    }
  };

  const formatTimeSlot = (slot) => {
    if (slot.start_time && slot.end_time) {
      return `${slot.start_time} - ${slot.end_time}`;
    }
    return slot.start_time || 'Time slot';
  };

  const closeBookingForm = () => {
    console.log('🔒 Closing booking form');
    setShowBookingForm(false);
    setFormData({ package: '', date: '', start_time: '', location: '', notes: '' });
    setFormErrors({});
    setTimeSlots([]);
    setSelectedPhotographerId(null);
    setSelectedSlotId(null);
  };

  const isSubmitDisabled = submitting || !formData.package || !formData.date || !formData.start_time || !formData.location.trim() || !selectedPhotographerId || !selectedSlotId;

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Client Detail Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Clients
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{client.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  {client.phone || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <button
              onClick={() => onEdit(client)}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none justify-center"
            >
              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setShowBookingForm(true)}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-1 sm:flex-none justify-center"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Create Booking</span>
              <span className="sm:hidden">Book</span>
            </button>
            <button
              onClick={handleSendWhatsApp}
              disabled={!client.phone}
              className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg flex-1 sm:flex-none justify-center ${
                client.phone
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!client.phone ? 'Phone number not available' : 'Send WhatsApp message'}
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Send Message</span>
              <span className="sm:hidden">Message</span>
            </button>
          </div>
        </div>
        
        {client.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Notes</h3>
            <p className="text-gray-700 text-sm sm:text-base">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-100 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-lg p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create New Booking</h2>
                <button 
                  onClick={closeBookingForm} 
                  className="text-gray-600 hover:text-gray-900"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Package</label>
                  <select
                    name="package"
                    value={formData.package}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm sm:text-base disabled:bg-gray-100"
                  >
                    <option value="">Select a package</option>
                    {loadingPackages ? (
                      <option>Loading packages...</option>
                    ) : (
                      packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.title} - ${parseFloat(pkg.price).toFixed(2)} ({pkg.duration_minutes} min)
                        </option>
                      ))
                    )}
                  </select>
                  {formErrors.package && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.package}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    disabled={submitting}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm sm:text-base disabled:bg-gray-100"
                  />
                  {formErrors.date && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                  <select
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    disabled={submitting || !formData.package || !formData.date}
                    className="w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <option value="">
                      {!formData.package || !formData.date 
                        ? 'Select package and date first' 
                        : loadingTimeSlots
                        ? 'Loading time slots...'
                        : timeSlots.length === 0
                        ? 'No available time slots'
                        : 'Select a time slot'
                      }
                    </option>
                    {!loadingTimeSlots && timeSlots.map((slot) => (
                      <option key={slot.id} value={slot.start_time}>
                        {formatTimeSlot(slot)}
                      </option>
                    ))}
                  </select>
                  {formErrors.start_time && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.start_time}</p>
                  )}
                  {formData.package && formData.date && !loadingTimeSlots && timeSlots.length === 0 && (
                    <p className="text-amber-600 text-xs sm:text-sm mt-1">
                      No available time slots for the selected date and package. Please choose a different date or package.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Enter shoot location"
                    className="w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm sm:text-base disabled:bg-gray-100"
                  />
                  {formErrors.location && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Any special requirements or notes..."
                    className="w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm sm:text-base disabled:bg-gray-100"
                    rows="3"
                  />
                </div>

                {formErrors.general && (
                  <p className="text-red-600 text-xs sm:text-sm">{formErrors.general}</p>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeBookingForm}
                    disabled={submitting}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base order-2 sm:order-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className={`px-4 py-2 text-sm sm:text-base order-1 sm:order-2 rounded-lg ${
                      isSubmitDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {submitting ? 'Creating...' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-blue-600 font-medium text-sm sm:text-base">Total Bookings</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{client.total_bookings || 0}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="text-green-600 font-medium text-sm sm:text-base">Total Spent</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            ${(client.total_spent || 0).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span className="text-purple-600 font-medium text-sm sm:text-base">Last Booking</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900 mt-1">
            {client.last_booking_date ? 
              new Date(client.last_booking_date).toLocaleDateString() : 
              'Never'
            }
          </p>
        </div>
      </div>

      {/* Booking History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Booking History</h2>
        </div>
        
        {loadingBookings ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {new Date(booking.date || booking.booking_date).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={booking.package_name || 'N/A'}>
                        {booking.package_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      ${(booking.total_price || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;