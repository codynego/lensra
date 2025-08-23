import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  ChevronRightIcon,
  PencilIcon,
  PhoneIcon,
  MailIcon,
  PlusIcon,
  XIcon,
  EyeIcon
} from '@heroicons/react/outline';
import { useApi } from '../../useApi';
import { format, isValid } from 'date-fns';

// Utility function for currency formatting
const formatCurrency = (value) => {
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ClientDetail = ({ client, onBack, onEdit }) => {
  const { apiFetch } = useApi();
  const [bookings, setBookings] = useState([]);
  const [clientStats, setClientStats] = useState({
    total_bookings: 0,
    total_spent: 0,
    last_booking_date: null,
  });
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [formData, setFormData] = useState({
    package: '',
    session_date: '',
    session_time: '',
    status: 'pending',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: 'pending'
  });

  useEffect(() => {
    if (client) {
      loadClientBookings();
      loadPackages();
    }
  }, [client]);

  const loadClientBookings = async () => {
    try {
      setLoadingBookings(true);
      setError(null);
      const response = await apiFetch(`/clients/${client.id}/bookings/`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`Failed to load bookings: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('API Response (loadClientBookings):', data); // Debug: Log raw API response

      // Normalize status and validate bookings
      const validBookings = data.map(booking => ({
        ...booking,
        status: booking.status ? booking.status.toLowerCase() : 'unknown',
        package_price: Number(booking.package_price) || 0,
      }));
      console.log('Valid Bookings:', validBookings); // Debug: Log processed bookings

      setBookings(validBookings);

      // Calculate client stats
      const total_bookings = validBookings.length;
      const total_spent = validBookings.reduce((sum, b) => sum + (Number(b.package_price) || 0), 0);
      const last_booking_date = validBookings.length > 0
        ? validBookings.reduce((latest, b) =>
            !b.session_date || !isValid(new Date(b.session_date))
              ? latest
              : !latest || new Date(b.session_date) > new Date(latest)
              ? b.session_date
              : latest, null)
        : null;

      console.log('Client Stats:', { total_bookings, total_spent, last_booking_date }); // Debug: Log stats
      setClientStats({ total_bookings, total_spent, last_booking_date });
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Fetch Error (loadClientBookings):', err); // Debug: Log error
      alert('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadPackages = async () => {
    try {
      setLoadingPackages(true);
      const response = await apiFetch(`/bookings/packages/`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`Failed to load packages: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('API Response (loadPackages):', data); // Debug: Log packages
      setPackages(data);
    } catch (err) {
      setError('Failed to load packages');
      console.error('Fetch Error (loadPackages):', err); // Debug: Log error
      alert('Failed to load packages');
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.package || isNaN(parseInt(formData.package, 10))) {
      errors.package = 'Please select a valid package';
    }
    if (!formData.session_date) {
      errors.session_date = 'Please select a date';
    } else {
      const sessionDate = new Date(formData.session_date);
      if (isNaN(sessionDate.getTime()) || sessionDate < new Date().setHours(0, 0, 0, 0)) {
        errors.session_date = 'Please select a future date';
      }
    }
    if (!formData.session_time) {
      errors.session_time = 'Please select a time';
    }
    if (!formData.status) {
      errors.status = 'Please select a status';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.log('Form Validation Errors:', errors); // Debug: Log validation errors
      return;
    }

    try {
      setSubmitting(true);
      const selectedPackage = packages.find((pkg) => pkg.id === parseInt(formData.package, 10));
      if (!selectedPackage) {
        throw new Error('Invalid package selected');
      }
      const payload = {
        client: client.id,
        service_package: parseInt(formData.package, 10),
        session_date: formData.session_date,
        session_time: formData.session_time,
        status: formData.status.toLowerCase(),
        notes: formData.notes.trim() || '',
        package_price: Number(selectedPackage.price) || 0
      };
      console.log('Booking Payload:', payload); // Debug: Log payload

      const response = await apiFetch(`/bookings/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Create Booking Response:', responseData); // Debug: Log response

      if (!response.ok) {
        let errorMessage = 'Failed to create booking';
        if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.non_field_errors) {
          errorMessage = responseData.non_field_errors[0];
        } else {
          const fieldErrors = {};
          Object.keys(responseData).forEach((key) => {
            fieldErrors[key] = Array.isArray(responseData[key]) ? responseData[key][0] : responseData[key];
          });
          if (fieldErrors.photographer) {
            fieldErrors.general = fieldErrors.photographer.includes('not associated')
              ? 'You must be registered as a photographer to create bookings.'
              : fieldErrors.photographer;
          }
          setFormErrors(fieldErrors);
          console.log('Field-specific Errors:', fieldErrors); // Debug: Log field errors
          return;
        }
        throw new Error(errorMessage);
      }

      alert('Booking created successfully');
      await loadClientBookings();
      closeBookingForm();
    } catch (err) {
      setFormErrors({ general: err.message || 'Failed to create booking' });
      console.error('Error Creating Booking:', err); // Debug: Log error
      alert(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
    setFormData({ package: '', session_date: '', session_time: '', status: 'pending', notes: '' });
    setFormErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        status: editFormData.status.toLowerCase()
      };
      console.log('Update Booking Payload:', payload); // Debug: Log payload

      const response = await apiFetch(`/bookings/bookings/${editingBooking.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Update Booking Response:', responseData); // Debug: Log response

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to update booking status to ${editFormData.status}`);
      }

      alert('Booking updated successfully');
      await loadClientBookings();
      setEditingBooking(null);
      setEditFormData({ status: 'pending' });
    } catch (err) {
      setFormErrors({ general: err.message || 'Failed to update booking' });
      console.error('Error Updating Booking:', err); // Debug: Log error
      alert(err.message || 'Failed to update booking');
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

  return (
    <div className="space-y-6 px-4 sm:px-6">
      {/* Client Detail Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
        >
          <ChevronRightIcon className="w-4 h-4 rotate-180" />
          Back to Clients
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{client.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1 truncate">
                  <MailIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </span>
                <span className="flex items-center gap-1">
                  <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
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
              <PencilIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setShowBookingForm(true)}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex-1 sm:flex-none justify-center"
            >
              <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Create Booking</span>
              <span className="sm:hidden">Book</span>
            </button>
            <button
              onClick={handleSendWhatsApp}
              disabled={!client.phone}
              className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg flex-1 sm:flex-none justify-center ${
                client.phone
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!client.phone ? 'Phone number not available' : 'Send WhatsApp message'}
            >
              <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Send Message</span>
              <span className="sm:hidden">Message</span>
            </button>
          </div>
        </div>
        
        {client.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Notes</h3>
            <p className="text-gray-700 text-sm sm:text-base">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-100 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create New Booking</h2>
                <button 
                  onClick={closeBookingForm} 
                  className="text-gray-600 hover:text-gray-900"
                  disabled={submitting}
                >
                  <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {formErrors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-red-700 text-sm">{formErrors.general}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Package *</label>
                  <select
                    name="package"
                    value={formData.package}
                    onChange={handleInputChange}
                    disabled={submitting || loadingPackages}
                    className={`w-full rounded-lg border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${
                      formErrors.package ? 'border-red-500' : 'border-gray-300'
                    } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  >
                    <option value="">{loadingPackages ? 'Loading packages...' : 'Select a package'}</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.title} - ${formatCurrency(pkg.price)} ({pkg.duration} min)
                      </option>
                    ))}
                  </select>
                  {formErrors.package && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.package}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Date *</label>
                  <input
                    type="date"
                    name="session_date"
                    value={formData.session_date}
                    onChange={handleInputChange}
                    disabled={submitting}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full rounded-lg border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${
                      formErrors.session_date ? 'border-red-500' : 'border-gray-300'
                    } disabled:bg-gray-100`}
                  />
                  {formErrors.session_date && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.session_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Time *</label>
                  <input
                    type="time"
                    name="session_time"
                    value={formData.session_time}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full rounded-lg border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${
                      formErrors.session_time ? 'border-red-500' : 'border-gray-300'
                    } disabled:bg-gray-100`}
                  />
                  {formErrors.session_time && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.session_time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full rounded-lg border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${
                      formErrors.status ? 'border-red-500' : 'border-gray-300'
                    } disabled:bg-gray-100`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {formErrors.status && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Enter any notes (e.g., location)"
                    className={`w-full rounded-lg border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${
                      formErrors.notes ? 'border-red-500' : 'border-gray-300'
                    } disabled:bg-gray-100`}
                  />
                  {formErrors.notes && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.notes}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeBookingForm}
                    disabled={submitting}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-4 py-2 text-sm sm:text-base rounded-lg ${
                      submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-100 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            <span className="text-indigo-600 font-medium text-sm sm:text-base">Total Bookings</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{clientStats.total_bookings}</p>
        </div>
        
        <div className="bg-indigo-100 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            <span className="text-indigo-600 font-medium text-sm sm:text-base">Total Spent</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            ${formatCurrency(clientStats.total_spent)}
          </p>
        </div>
        
        <div className="bg-indigo-100 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            <span className="text-indigo-600 font-medium text-sm sm:text-base">Last Booking</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900 mt-1">
            {clientStats.last_booking_date && isValid(new Date(clientStats.last_booking_date))
              ? format(new Date(clientStats.last_booking_date), 'MM/dd/yyyy')
              : 'Never'
            }
          </p>
        </div>
      </div>

      {/* Booking History */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Booking History</h2>
        </div>
        
        {loadingBookings ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {booking.session_date && isValid(new Date(booking.session_date))
                        ? format(new Date(booking.session_date), 'MM/dd/yyyy')
                        : 'N/A'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">
                      <div
                        className="max-w-xs truncate"
                        title={
                          typeof booking.service_package === 'object'
                            ? booking.service_package?.title || 'N/A'
                            : booking.service_package || 'N/A'
                        }
                      >
                        {typeof booking.service_package === 'object'
                          ? booking.service_package?.title || 'N/A'
                          : booking.service_package || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-indigo-100 text-indigo-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : booking.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      ${formatCurrency(booking.package_price)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            console.log('Selected Booking:', booking); // Debug: Log selected booking
                            setSelectedBooking(booking);
                          }}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            console.log('Editing Booking:', booking); // Debug: Log editing booking
                            setEditingBooking(booking);
                            setEditFormData({ status: booking.status });
                          }}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Edit Booking"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => {
                  console.log('Closing Preview Modal'); // Debug: Log modal close
                  setSelectedBooking(null);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Date:</strong>{' '}
                {selectedBooking.session_date && isValid(new Date(selectedBooking.session_date))
                  ? format(new Date(selectedBooking.session_date), 'MM/dd/yyyy')
                  : 'N/A'}
              </p>
              <p>
                <strong>Time:</strong> {selectedBooking.session_time || 'N/A'}
              </p>
              <p>
                <strong>Package:</strong>{' '}
                {typeof selectedBooking.service_package === 'object'
                  ? selectedBooking.service_package?.title || 'N/A'
                  : selectedBooking.service_package || 'N/A'}
              </p>
              <p>
                <strong>Status:</strong> {selectedBooking.status || 'unknown'}
              </p>
              <p>
                <strong>Price:</strong> ${formatCurrency(selectedBooking.package_price)}
              </p>
              <p>
                <strong>Notes:</strong> {selectedBooking.notes || 'N/A'}
              </p>
              <p>
                <strong>Location:</strong> {selectedBooking.location || 'N/A'}
              </p>
              <p>
                <strong>Client:</strong> {selectedBooking.client || 'N/A'}
              </p>
              <p>
                <strong>Photographer:</strong> {selectedBooking.photographer || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Booking</h2>
              <button
                onClick={() => {
                  console.log('Closing Edit Modal'); // Debug: Log modal close
                  setEditingBooking(null);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 text-sm sm:text-base rounded-lg ${
                    submitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;